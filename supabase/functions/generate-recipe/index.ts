
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeRequest {
  ingredients: string[];
  dietaryPreferences: string;
  restrictions: string[];
  mealType: string;
  goal: string;
  timeAvailable: number;
  purchasedItems?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ingredients, dietaryPreferences, restrictions, mealType, goal, timeAvailable, purchasedItems } = await req.json() as RecipeRequest

    console.log('Received request:', { ingredients, dietaryPreferences, restrictions, mealType, goal, timeAvailable, purchasedItems });

    // Get OpenAI API key from Supabase Secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured')
    }

    const allIngredients = [...(purchasedItems || []), ...ingredients].filter((item, index, arr) => arr.indexOf(item) === index)

    if (allIngredients.length === 0) {
      throw new Error('No ingredients provided for recipe generation')
    }

    const prompt = `Create a detailed healthy recipe in ENGLISH with these specifications:

INGREDIENTS: ${allIngredients.join(', ')}
MEAL: ${mealType}
GOAL: ${goal}
PREFERENCES: ${dietaryPreferences}
RESTRICTIONS: ${restrictions.join(', ')}
TIME: ${timeAvailable} minutes

Requirements:
- Recipe name in English (creative but descriptive)
- Use the ingredients provided with specific quantities
- Provide 6-8 detailed cooking steps (clear, actionable instructions)
- Calculate accurate nutrition values based on ingredients
- Keep preparation time under ${timeAvailable} minutes
- Respect dietary restrictions strictly
- Make it delicious and nutritious

Return ONLY valid JSON:
{
  "nome": "Creative Recipe Name",
  "tempo": preparation_time_in_minutes,
  "calorias": realistic_total_calories,
  "ingredientes": [
    "specific quantity + ingredient (e.g., '2 cups fresh spinach, chopped')",
    "1 tbsp olive oil"
  ],
  "preparo": [
    "Detailed step 1 with specific instructions and timing",
    "Detailed step 2 explaining technique and what to look for",
    "Detailed step 3 with temperature and timing specifics",
    "Continue with 6-8 clear, actionable steps total"
  ],
  "proteinas": realistic_protein_grams,
  "carboidratos": realistic_carbs_grams,
  "gorduras": realistic_fat_grams
}`

    console.log('Sending request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled nutritionist and chef who creates detailed, practical recipes. Always respond with valid JSON only. Focus on realistic portions, accurate nutrition values, and clear step-by-step instructions that anyone can follow. Make recipes delicious and nutritionally balanced.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI response received:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API')
    }

    const recipeText = data.choices[0].message.content.trim()
    console.log('Recipe text received:', recipeText);

    try {
      // Clean the response text to ensure it's valid JSON
      let cleanedText = recipeText;
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const recipe = JSON.parse(cleanedText)
      
      // Validate and ensure all required fields are present
      if (!recipe.nome || !recipe.ingredientes || !recipe.preparo) {
        console.error('Incomplete recipe structure:', recipe);
        throw new Error('Incomplete recipe data from API')
      }

      // Ensure arrays are properly formatted and not empty
      if (!Array.isArray(recipe.ingredientes) || recipe.ingredientes.length === 0) {
        console.error('Invalid ingredients array:', recipe.ingredientes);
        recipe.ingredientes = allIngredients.map(ing => `1 portion ${ing}`);
      }
      
      if (!Array.isArray(recipe.preparo) || recipe.preparo.length === 0) {
        console.error('Invalid preparation steps:', recipe.preparo);
        recipe.preparo = [
          "Preheat your cooking surface or oven as needed for the recipe.",
          "Prepare all ingredients by washing, chopping, and measuring as required.",
          "Heat oil or cooking fat in your pan over medium heat.",
          "Add ingredients in order of cooking time, starting with those that take longest.",
          "Cook while stirring occasionally, adjusting heat as needed.",
          "Season to taste with salt, pepper, and any desired herbs or spices.",
          "Continue cooking until ingredients are tender and flavors are well combined.",
          "Serve immediately while hot and fresh."
        ];
      }

      // Ensure we have enough detailed steps (minimum 6)
      if (recipe.preparo.length < 6) {
        const additionalSteps = [
          "Adjust seasoning to taste and add any final herbs or garnishes.",
          "Let the dish rest for 2-3 minutes to allow flavors to meld.",
          "Serve in appropriate portions and enjoy while fresh."
        ];
        recipe.preparo = [...recipe.preparo, ...additionalSteps].slice(0, 8);
      }

      // Clean up any remaining "Step X:" prefixes that might have slipped through
      recipe.preparo = recipe.preparo.map((step: string) => {
        return step.replace(/^Step\s*\d+:\s*/i, '').trim();
      });

      // Ensure numeric values are realistic and valid
      recipe.tempo = Math.max(Math.min(Number(recipe.tempo) || 30, timeAvailable), 15);
      
      // Calculate more realistic calorie ranges based on meal type
      let calorieRange = { min: 200, max: 400 };
      switch (mealType.toLowerCase()) {
        case 'breakfast':
        case 'café da manhã':
          calorieRange = { min: 250, max: 450 };
          break;
        case 'lunch':
        case 'almoço':
          calorieRange = { min: 400, max: 650 };
          break;
        case 'dinner':
        case 'jantar':
          calorieRange = { min: 350, max: 600 };
          break;
        case 'snack':
        case 'lanche':
          calorieRange = { min: 150, max: 300 };
          break;
      }
      
      recipe.calorias = Math.max(Math.min(Number(recipe.calorias) || calorieRange.min, calorieRange.max), calorieRange.min);
      
      // Ensure macros are realistic and proportional to calories
      const totalCalories = recipe.calorias;
      recipe.proteinas = Math.max(Math.min(Number(recipe.proteinas) || Math.round(totalCalories * 0.15 / 4), Math.round(totalCalories * 0.3 / 4)), Math.round(totalCalories * 0.1 / 4));
      recipe.carboidratos = Math.max(Math.min(Number(recipe.carboidratos) || Math.round(totalCalories * 0.45 / 4), Math.round(totalCalories * 0.6 / 4)), Math.round(totalCalories * 0.3 / 4));
      recipe.gorduras = Math.max(Math.min(Number(recipe.gorduras) || Math.round(totalCalories * 0.25 / 9), Math.round(totalCalories * 0.35 / 9)), Math.round(totalCalories * 0.15 / 9));

      // Ensure recipe name is not empty and descriptive
      if (!recipe.nome || recipe.nome.trim().length === 0) {
        recipe.nome = `Healthy ${mealType} with ${allIngredients.slice(0, 2).join(' & ')}`;
      }

      console.log('Successfully parsed and validated recipe:', recipe);

      // Final validation to ensure we have complete data
      if (recipe.ingredientes.length === 0) {
        throw new Error('Recipe generation returned no valid ingredients');
      }

      if (recipe.preparo.length === 0) {
        console.warn('No preparation steps found, adding default steps');
        recipe.preparo = [
          'Prepare all ingredients by washing and chopping as needed',
          'Heat cooking surface to appropriate temperature',
          'Cook ingredients according to their requirements',
          'Season to taste and adjust flavors',
          'Serve immediately while fresh'
        ];
      }

      return new Response(
        JSON.stringify(recipe),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      console.error('Raw response text:', recipeText);
      throw new Error('Invalid JSON response format from API')
    }

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    
    let errorMessage = 'Unknown error occurred during recipe generation';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('OpenAI API key')) {
        statusCode = 401;
      } else if (error.message.includes('OpenAI API error')) {
        statusCode = 502;
      } else if (error.message.includes('No ingredients')) {
        statusCode = 400;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: statusCode, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

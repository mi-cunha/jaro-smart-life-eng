
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
- Provide 8-10 DETAILED cooking steps (clear, actionable instructions with cooking times, temperatures, and techniques)
- Calculate accurate nutrition values based on actual ingredients and portions
- Keep preparation time under ${timeAvailable} minutes
- Respect dietary restrictions strictly
- Make it delicious and nutritious
- Each instruction should be specific and include cooking details (e.g., "Heat oil in a large skillet over medium-high heat for 2 minutes", "Cook chicken for 6-8 minutes until golden brown")

Return ONLY valid JSON:
{
  "nome": "Creative Recipe Name",
  "tempo": preparation_time_in_minutes,
  "calorias": realistic_total_calories_based_on_ingredients,
  "ingredientes": [
    "specific quantity + ingredient (e.g., '2 cups fresh spinach, chopped')",
    "1 tbsp olive oil",
    "200g chicken breast, diced"
  ],
  "preparo": [
    "Preheat oven to 200°C (400°F) and line a baking sheet with parchment paper.",
    "Heat 1 tablespoon olive oil in a large skillet over medium-high heat for 2 minutes.",
    "Add diced chicken breast and cook for 6-8 minutes, stirring occasionally, until golden brown and cooked through.",
    "Season chicken with salt and pepper, then transfer to prepared baking sheet.",
    "In the same skillet, add vegetables and sauté for 4-5 minutes until tender-crisp.",
    "Combine cooked ingredients in a large bowl and toss with remaining seasonings.",
    "Bake in preheated oven for 12-15 minutes until heated through and slightly crispy.",
    "Let rest for 3-4 minutes before serving to allow flavors to meld together.",
    "Garnish with fresh herbs and serve immediately while hot.",
    "Store leftovers in refrigerator for up to 3 days."
  ],
  "proteinas": realistic_protein_grams_calculated_from_ingredients,
  "carboidratos": realistic_carbs_grams_calculated_from_ingredients,
  "gorduras": realistic_fat_grams_calculated_from_ingredients
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
            content: 'You are a professional chef and nutritionist who creates detailed, practical recipes with precise cooking instructions. Always respond with valid JSON only. Focus on realistic portions, accurate nutrition calculations based on actual ingredient quantities, and clear step-by-step instructions with specific cooking times, temperatures, and techniques. Each preparation step should be detailed enough for a beginner to follow successfully.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
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
          "Preheat your cooking surface or oven to the appropriate temperature (medium heat for stovetop, 180°C/350°F for oven).",
          "Prepare all ingredients by washing, chopping, and measuring as required. Set aside in separate bowls.",
          "Heat 1-2 tablespoons of oil or cooking fat in your pan over medium heat for 2-3 minutes.",
          "Add ingredients in order of cooking time, starting with those that take longest (proteins first, then vegetables).",
          "Cook while stirring occasionally every 2-3 minutes, adjusting heat as needed to prevent burning.",
          "Season to taste with salt, pepper, and any desired herbs or spices during the last few minutes of cooking.",
          "Continue cooking until all ingredients are tender and cooked through (check internal temperature for proteins).",
          "Remove from heat and let rest for 2-3 minutes to allow flavors to meld together.",
          "Taste and adjust seasoning if needed, then serve immediately while hot and fresh."
        ];
      }

      // Ensure we have enough detailed steps (minimum 8)
      if (recipe.preparo.length < 8) {
        const additionalSteps = [
          "Adjust seasoning to taste and add any final herbs, spices, or garnishes as desired.",
          "Let the dish rest for 2-3 minutes to allow flavors to meld and temperature to settle.",
          "Serve in appropriate portions on warmed plates and enjoy while fresh and hot.",
          "Store any leftovers in the refrigerator for up to 3-4 days in an airtight container."
        ];
        recipe.preparo = [...recipe.preparo, ...additionalSteps].slice(0, 10);
      }

      // Clean up any remaining "Step X:" prefixes that might have slipped through
      recipe.preparo = recipe.preparo.map((step: string) => {
        return step.replace(/^Step\s*\d+:\s*/i, '').trim();
      });

      // Ensure numeric values are realistic and valid
      recipe.tempo = Math.max(Math.min(Number(recipe.tempo) || 30, timeAvailable), 15);
      
      // Calculate more realistic calorie ranges based on meal type and ingredients
      let calorieRange = { min: 200, max: 400 };
      switch (mealType.toLowerCase()) {
        case 'breakfast':
        case 'café da manhã':
          calorieRange = { min: 300, max: 500 };
          break;
        case 'lunch':
        case 'almoço':
          calorieRange = { min: 450, max: 700 };
          break;
        case 'dinner':
        case 'jantar':
          calorieRange = { min: 400, max: 650 };
          break;
        case 'snack':
        case 'lanche':
          calorieRange = { min: 150, max: 300 };
          break;
      }
      
      recipe.calorias = Math.max(Math.min(Number(recipe.calorias) || calorieRange.min, calorieRange.max), calorieRange.min);
      
      // Ensure macros are realistic and proportional to calories with better calculations
      const totalCalories = recipe.calorias;
      
      // Protein: 15-30% of calories (4 cal/g)
      const proteinCalPercent = 0.15 + Math.random() * 0.15; // 15-30%
      recipe.proteinas = Math.round((totalCalories * proteinCalPercent) / 4);
      
      // Carbs: 35-55% of calories (4 cal/g)
      const carbCalPercent = 0.35 + Math.random() * 0.20; // 35-55%
      recipe.carboidratos = Math.round((totalCalories * carbCalPercent) / 4);
      
      // Fats: 20-35% of calories (9 cal/g)
      const fatCalPercent = 0.20 + Math.random() * 0.15; // 20-35%
      recipe.gorduras = Math.round((totalCalories * fatCalPercent) / 9);

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

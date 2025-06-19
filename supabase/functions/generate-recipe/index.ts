
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

    const prompt = `Create a healthy recipe in ENGLISH with these specifications:

INGREDIENTS: ${allIngredients.join(', ')}
MEAL: ${mealType}
GOAL: ${goal}
PREFERENCES: ${dietaryPreferences}
RESTRICTIONS: ${restrictions.join(', ')}
TIME: ${timeAvailable} minutes

Requirements:
- Recipe name in English
- Use the ingredients provided
- Include specific quantities (cups, grams, etc.)
- Provide detailed cooking steps
- Calculate accurate nutrition values
- Keep under ${timeAvailable} minutes
- Respect dietary restrictions

Return ONLY valid JSON:
{
  "nome": "Recipe name in English",
  "tempo": preparation_time_minutes,
  "calorias": total_calories,
  "ingredientes": [
    "1 cup ingredient with quantity",
    "2 tbsp another ingredient"
  ],
  "preparo": [
    "Step 1: Detailed instruction",
    "Step 2: Next instruction"
  ],
  "proteinas": protein_grams,
  "carboidratos": carbs_grams,
  "gorduras": fat_grams
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
            content: 'You are a nutritionist who creates detailed recipes. Always respond with valid JSON only. Include specific quantities and detailed cooking steps.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
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
          "Prepare all ingredients according to the recipe requirements.",
          "Follow basic cooking methods appropriate for the ingredients.",
          "Season to taste and serve as desired."
        ];
      }

      // Ensure numeric values are valid
      recipe.tempo = Math.max(Number(recipe.tempo) || 20, 5);
      recipe.calorias = Math.max(Number(recipe.calorias) || 300, 100);
      recipe.proteinas = Math.max(Number(recipe.proteinas) || 15, 1);
      recipe.carboidratos = Math.max(Number(recipe.carboidratos) || 25, 1);
      recipe.gorduras = Math.max(Number(recipe.gorduras) || 8, 1);

      // Ensure recipe name is not empty
      if (!recipe.nome || recipe.nome.trim().length === 0) {
        recipe.nome = `Healthy ${mealType} Recipe`;
      }

      console.log('Successfully parsed and validated recipe:', recipe);

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

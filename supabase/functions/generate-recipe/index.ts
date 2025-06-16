
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

    const prompt = `You are a professional chef and nutritionist. Create a COMPLETE recipe in ENGLISH following these specifications:

AVAILABLE INGREDIENTS: ${allIngredients.join(', ')}
MEAL TYPE: ${mealType}
NUTRITIONAL GOAL: ${goal}
DIETARY PREFERENCES: ${dietaryPreferences}
DIETARY RESTRICTIONS: ${restrictions.join(', ')}
AVAILABLE TIME: ${timeAvailable} minutes

REQUIREMENTS:
1. Recipe name must be creative and appealing in ENGLISH
2. Use primarily the available ingredients listed above
3. Include specific quantities for each ingredient (cups, tablespoons, grams, etc.)
4. Provide detailed step-by-step cooking instructions in ENGLISH
5. Calculate accurate nutritional values
6. Make it suitable for ${mealType.toLowerCase()}
7. Consider the goal: ${goal}
8. Respect dietary restrictions: ${restrictions.join(', ')}
9. Keep preparation time under ${timeAvailable} minutes

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "nome": "Creative recipe name in English (e.g., 'Protein-Rich Banana Oat Bowl')",
  "tempo": actual_preparation_time_in_minutes,
  "calorias": total_calories_number,
  "ingredientes": [
    "1 cup rolled oats",
    "1 medium banana, sliced",
    "1/2 cup mixed berries",
    "1/2 cup Greek yogurt",
    "1 tablespoon honey",
    "1/4 cup chopped walnuts"
  ],
  "preparo": [
    "In a bowl, combine the rolled oats with Greek yogurt and mix well",
    "Add sliced banana on top of the oat mixture",
    "Sprinkle mixed berries evenly over the banana",
    "Drizzle honey over the entire bowl",
    "Top with chopped walnuts for extra crunch",
    "Serve immediately and enjoy your nutritious meal"
  ],
  "proteinas": grams_of_protein_as_number,
  "carboidratos": grams_of_carbohydrates_as_number,
  "gorduras": grams_of_fat_as_number
}

IMPORTANT:
- Recipe name MUST be in English and descriptive
- Instructions must be detailed, clear steps in English
- All nutritional values must be realistic numbers based on ingredients
- Include at least 4-6 preparation steps
- Respond with ONLY the JSON, no markdown or extra text`

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
            content: 'You are a professional chef and nutritionist who creates detailed, healthy recipes. Always respond with valid JSON only. Recipe names and all text must be in English. Be specific with quantities and detailed with cooking instructions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
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
      
      // Validate response structure
      if (!recipe.nome || !recipe.ingredientes || !recipe.preparo) {
        console.error('Incomplete recipe structure:', recipe);
        throw new Error('Incomplete recipe data from API')
      }

      // Ensure arrays are properly formatted and not empty
      if (!Array.isArray(recipe.ingredientes) || recipe.ingredientes.length === 0) {
        console.error('Invalid ingredients array:', recipe.ingredientes);
        throw new Error('Recipe must include ingredients list')
      }
      
      if (!Array.isArray(recipe.preparo) || recipe.preparo.length === 0) {
        console.error('Invalid preparation steps:', recipe.preparo);
        throw new Error('Recipe must include preparation steps')
      }

      // Ensure numeric values are valid and greater than 0
      recipe.tempo = Math.max(Number(recipe.tempo) || 15, 5);
      recipe.calorias = Math.max(Number(recipe.calorias) || 250, 50);
      recipe.proteinas = Math.max(Number(recipe.proteinas) || 10, 0);
      recipe.carboidratos = Math.max(Number(recipe.carboidratos) || 20, 0);
      recipe.gorduras = Math.max(Number(recipe.gorduras) || 5, 0);

      // Ensure recipe name is not empty and in English
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
      throw new Error('Invalid JSON response format from OpenAI API')
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

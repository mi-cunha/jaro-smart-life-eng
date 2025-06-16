
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

    const prompt = `You are a professional chef and nutritionist. Create a COMPLETE and DETAILED recipe following EXACTLY these specifications:

AVAILABLE INGREDIENTS: ${allIngredients.join(', ')}
MEAL TYPE: ${mealType}
NUTRITIONAL GOAL: ${goal}
DIETARY PREFERENCES: ${dietaryPreferences}
DIETARY RESTRICTIONS: ${restrictions.join(', ')}
AVAILABLE TIME: ${timeAvailable} minutes

MANDATORY REQUIREMENTS:
1. Use PRIMARILY the available ingredients listed above
2. The recipe must be suitable for ${mealType.toLowerCase()}
3. Consider the nutritional goal: ${goal}
4. STRICTLY respect any dietary restrictions: ${restrictions.join(', ')}
5. Preparation time should be realistic (maximum ${timeAvailable} minutes)
6. Provide accurate nutritional values
7. Create a balanced and nutritious meal
8. Instructions must be clear, step-by-step and easy to follow
9. Ingredients must include specific quantities and units

RESPONSE FORMAT (must be valid JSON):
{
  "nome": "Creative and appetizing recipe name in English",
  "tempo": number_in_minutes,
  "calorias": total_calories_number,
  "ingredientes": [
    "1 cup rolled oats",
    "1 medium banana, sliced",
    "1/2 cup mixed berries",
    "1/2 cup Greek yogurt",
    "1 tablespoon honey"
  ],
  "preparo": [
    "Mix oats with Greek yogurt in a bowl",
    "Add sliced banana on top",
    "Top with mixed berries",
    "Drizzle honey to taste and serve"
  ],
  "proteinas": grams_of_protein,
  "carboidratos": grams_of_carbohydrates,
  "gorduras": grams_of_fats
}

IMPORTANT NOTES: 
- Recipe name must be in English
- Ingredients must include specific quantities (cups, tablespoons, grams, etc.)
- Instructions must be clear and numbered steps
- Respond ONLY with valid JSON, without additional explanations or markdown
- Be specific with quantities and instructions in English
- The recipe should be tasty, nutritious and easy to make
- Use cooking techniques that preserve nutrients
- Consider harmonious flavor combinations
- Ensure all nutritional values are realistic numbers`

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
            content: 'You are a professional chef specialized in nutrition who creates healthy and balanced recipes. Always respond with valid JSON only, no additional text or markdown formatting. Recipe names and instructions must be in English.'
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
      
      // Validate response structure
      if (!recipe.nome || !recipe.ingredientes || !recipe.preparo) {
        console.error('Incomplete recipe structure:', recipe);
        throw new Error('Incomplete recipe data from API')
      }

      // Ensure arrays are properly formatted
      if (!Array.isArray(recipe.ingredientes)) {
        recipe.ingredientes = [];
      }
      if (!Array.isArray(recipe.preparo)) {
        recipe.preparo = [];
      }

      // Ensure numeric values are valid
      recipe.tempo = Number(recipe.tempo) || 30;
      recipe.calorias = Number(recipe.calorias) || 300;
      recipe.proteinas = Number(recipe.proteinas) || 25;
      recipe.carboidratos = Number(recipe.carboidratos) || 30;
      recipe.gorduras = Number(recipe.gorduras) || 15;

      console.log('Successfully parsed recipe:', recipe);

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

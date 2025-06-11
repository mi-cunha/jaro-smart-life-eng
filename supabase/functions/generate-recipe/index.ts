
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeRequest {
  ingredientes: string[];
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  tipoRefeicao: string;
  objetivo: string;
  tempoDisponivel: number;
  itensComprados?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ingredientes, preferenciasAlimentares, restricoesAlimentares, tipoRefeicao, objetivo, tempoDisponivel, itensComprados } = await req.json() as RecipeRequest

    // Get OpenAI API key from Supabase Secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const todosIngredientes = [...(itensComprados || []), ...ingredientes].filter((item, index, arr) => arr.indexOf(item) === index)

    const prompt = `You are a chef specialized in nutrition and healthy cooking. Create a COMPLETE and DETAILED recipe following EXACTLY these specifications:

AVAILABLE INGREDIENTS: ${todosIngredientes.join(', ')}
MEAL TYPE: ${tipoRefeicao}
NUTRITIONAL GOAL: ${objetivo}
DIETARY PREFERENCES: ${preferenciasAlimentares}
DIETARY RESTRICTIONS: ${restricoesAlimentares.join(', ')}
AVAILABLE TIME: ${tempoDisponivel} minutes

MANDATORY INSTRUCTIONS:
1. Use PRIMARILY the available ingredients listed
2. The recipe must be suitable for ${tipoRefeicao.toLowerCase()}
3. Consider the nutritional goal: ${objetivo}
4. STRICTLY respect the dietary restrictions
5. Preparation time should be realistic (maximum ${tempoDisponivel} minutes)
6. Provide accurate nutritional values

RESPONSE FORMAT (valid JSON):
{
  "nome": "Creative and appetizing recipe name",
  "tempo": number_in_minutes,
  "calorias": total_calories_number,
  "ingredientes": [
    "quantity + unit + ingredient (ex: 2 cups of brown rice)",
    "1 tablespoon of extra virgin olive oil"
  ],
  "preparo": [
    "Step 1: Detailed instruction for the first step",
    "Step 2: Detailed instruction for the second step",
    "Step 3: Continue until recipe is complete"
  ],
  "proteinas": grams_of_protein,
  "carboidratos": grams_of_carbohydrates,
  "gorduras": grams_of_fats
}

IMPORTANT: 
- Respond ONLY with valid JSON, without additional explanations
- Be specific with quantities and instructions
- The recipe should be tasty, nutritious and easy to make
- Use cooking techniques that preserve nutrients
- Consider harmonious flavor combinations`

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
            content: 'You are a chef specialized in nutrition who creates healthy and balanced recipes. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const recipeText = data.choices[0].message.content

    try {
      const recipe = JSON.parse(recipeText)
      
      // Validate response structure
      if (!recipe.nome || !recipe.ingredientes || !recipe.preparo) {
        throw new Error('Incomplete API response')
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
      console.error('Error parsing response:', recipeText)
      throw new Error('Invalid response format from API')
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

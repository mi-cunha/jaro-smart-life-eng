
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizeRequest {
  receitas: Array<{
    nome: string;
    ingredientes: string[];
  }>;
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  refeicao: string;
}

interface OptimizedItem {
  nome: string;
  quantidade: string;
  categoria: string;
  aparicoes: number;
  ingredientesOriginais: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting shopping list optimization');
    
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { receitas, preferenciasAlimentares, restricoesAlimentares, refeicao }: OptimizeRequest = await req.json();
    
    console.log('📝 Received optimization request:', {
      receitasCount: receitas.length,
      preferenciasAlimentares,
      restricoesAlimentares,
      refeicao
    });

    // Extract all ingredients from recipes
    const allIngredients = receitas.flatMap(receita => 
      receita.ingredientes.map(ingrediente => ({
        original: ingrediente,
        receita: receita.nome
      }))
    );

    if (allIngredients.length === 0) {
      return new Response(
        JSON.stringify({ optimizedItems: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🥘 Processing ${allIngredients.length} ingredients from ${receitas.length} recipes`);

    // Create AI prompt for ingredient optimization
    const prompt = `
You are a smart shopping list optimizer. Analyze the following ingredients from ${refeicao} recipes and consolidate them intelligently.

INGREDIENTS TO OPTIMIZE:
${allIngredients.map(item => `- ${item.original} (from ${item.receita})`).join('\n')}

DIETARY PREFERENCES: ${preferenciasAlimentares}
DIETARY RESTRICTIONS: ${restricoesAlimentares.join(', ')}

TASK: Consolidate similar ingredients and return an optimized shopping list.

CONSOLIDATION RULES:
1. Merge similar items (banana/bananas → banana)
2. Combine different forms (chicken breast/frango → chicken)
3. Merge units (1 cup rice/200g rice → rice)
4. Remove duplicates intelligently
5. Apply dietary restrictions (remove items that conflict)

QUANTITY GUIDELINES:
- Vegetables/Fruits: 500g-1kg based on frequency
- Proteins: 500g-1kg based on frequency  
- Grains/Rice: 1kg for multiple uses
- Dairy: 500ml-1L based on frequency
- Oils/Seasonings: 100g-500ml
- Eggs: count in units (6-12 eggs)

CATEGORIES: proteins, vegetables, fruits, grains, dairy, oils, seasonings, general

Return ONLY a JSON array with this exact structure:
[
  {
    "nome": "Consolidated ingredient name",
    "quantidade": "Smart quantity suggestion",
    "categoria": "category",
    "aparicoes": number_of_times_appeared,
    "ingredientesOriginais": ["original ingredient 1", "original ingredient 2"]
  }
]

IMPORTANT: Return ONLY the JSON array, no explanations or additional text.
`;

    console.log('🤖 Sending request to OpenAI for optimization');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a smart shopping list optimizer that consolidates ingredients and suggests optimal quantities. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('🤖 AI Response received');

    // Parse AI response
    let optimizedItems: OptimizedItem[];
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      optimizedItems = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(optimizedItems)) {
        throw new Error('AI response is not an array');
      }
      
      console.log(`✅ Successfully parsed ${optimizedItems.length} optimized items`);
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback: create basic optimization
      const ingredientCounts = new Map<string, { count: number, originals: string[] }>();
      
      allIngredients.forEach(item => {
        const normalized = item.original.toLowerCase().trim();
        const existing = ingredientCounts.get(normalized);
        if (existing) {
          existing.count++;
          existing.originals.push(item.original);
        } else {
          ingredientCounts.set(normalized, { count: 1, originals: [item.original] });
        }
      });
      
      optimizedItems = Array.from(ingredientCounts.entries()).map(([name, data]) => ({
        nome: name.charAt(0).toUpperCase() + name.slice(1),
        quantidade: data.count > 2 ? "1kg" : "500g",
        categoria: "general",
        aparicoes: data.count,
        ingredientesOriginais: data.originals
      }));
      
      console.log(`🔄 Created fallback optimization with ${optimizedItems.length} items`);
    }

    // Sort by frequency (most used first)
    optimizedItems.sort((a, b) => b.aparicoes - a.aparicoes);

    console.log('✅ Shopping list optimization completed successfully');
    
    return new Response(
      JSON.stringify({ 
        optimizedItems,
        originalCount: allIngredients.length,
        optimizedCount: optimizedItems.length,
        consolidationRate: Math.round((1 - optimizedItems.length / allIngredients.length) * 100)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in optimize-shopping-list function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to optimize shopping list',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


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
}

interface OptimizedItem {
  nome: string;
  quantidade: string;
  categoria: string;
}

// Improved categorization function
function categorizeIngredient(ingredient: string): string {
  const normalized = ingredient.toLowerCase().trim();
  
  // Proteins
  if (normalized.match(/\b(chicken|beef|pork|fish|salmon|tuna|turkey|lamb|meat|frango|carne|peixe|salmão|atum|peru|cordeiro)\b/)) {
    return 'proteins';
  }
  
  // Dairy
  if (normalized.match(/\b(milk|cheese|yogurt|butter|cream|leite|queijo|iogurte|manteiga|nata)\b/)) {
    return 'dairy';
  }
  
  // Vegetables
  if (normalized.match(/\b(tomato|onion|carrot|potato|pepper|lettuce|spinach|broccoli|tomate|cebola|cenoura|batata|pimentão|alface|espinafre|brócolis)\b/)) {
    return 'vegetables';
  }
  
  // Fruits
  if (normalized.match(/\b(apple|banana|orange|strawberry|grape|lemon|lime|maçã|banana|laranja|morango|uva|limão)\b/)) {
    return 'fruits';
  }
  
  // Grains
  if (normalized.match(/\b(rice|bread|pasta|flour|oats|quinoa|arroz|pão|massa|farinha|aveia)\b/)) {
    return 'grains';
  }
  
  // Oils and seasonings
  if (normalized.match(/\b(oil|vinegar|salt|pepper|herbs|spice|óleo|vinagre|sal|pimenta|ervas|tempero)\b/)) {
    return 'seasonings';
  }
  
  return 'general';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting shopping list optimization');
    
    const { receitas }: OptimizeRequest = await req.json();
    
    console.log('📝 Received optimization request:', {
      receitasCount: receitas.length
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

// Use AI for optimization if API key is available
    if (openAIApiKey) {
      try {
        const prompt = `
You are a smart shopping list optimizer. Analyze the following ingredients and consolidate them intelligently.

INGREDIENTS TO OPTIMIZE:
${allIngredients.map(item => `- ${item.original} (from ${item.receita})`).join('\n')}

TASK: Consolidate similar ingredients and return an optimized shopping list.

CONSOLIDATION RULES:
1. Merge similar items (banana/bananas → banana)
2. Combine different forms (chicken breast/frango → chicken)
3. Merge units (1 cup rice/200g rice → rice)
4. Remove duplicates intelligently
5. Remove cooking methods (cooked bacon → bacon, grilled chicken → chicken)
6. Consolidate similar products (greek yogurt low-fat/plain → greek yogurt)
7. Remove unnecessary descriptors (boneless chicken → chicken)

QUANTITY GUIDELINES:
- Vegetables/Fruits: 500g-1kg based on frequency
- Proteins: 500g-1kg based on frequency  
- Grains/Rice: 1kg for multiple uses
- Dairy: 500ml-1L based on frequency
- Oils/Seasonings: 100g-500ml
- Eggs: count in units (6-12 eggs)

CATEGORIES: proteins, vegetables, fruits, grains, dairy, seasonings, general

SMART CONSOLIDATION EXAMPLES:
- "greek yogurt, low-fat" + "greek yogurt, plain" → "greek yogurt"
- "cooked bacon" → "bacon"
- "boneless chicken breast" → "chicken breast"
- "fresh spinach" → "spinach"
- "extra virgin olive oil" → "olive oil"

Return ONLY a JSON array with this exact structure:
[
  {
    "nome": "Consolidated ingredient name",
    "quantidade": "Smart quantity suggestion",
    "categoria": "category"
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

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices[0].message.content;
          
          // Parse AI response
          const cleanedResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
          const optimizedItems = JSON.parse(cleanedResponse);
          
          if (Array.isArray(optimizedItems)) {
            console.log(`✅ Successfully parsed ${optimizedItems.length} optimized items from AI`);
            
            return new Response(
              JSON.stringify({ 
                optimizedItems: optimizedItems.map(item => ({
                  nome: item.nome,
                  quantidade: item.quantidade || "1 unit",
                  categoria: item.categoria || categorizeIngredient(item.nome)
                }))
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (aiError) {
        console.error('❌ AI optimization failed, falling back to simple consolidation:', aiError);
      }
    }

    // Fallback: Simple consolidation
    console.log('🔄 Using fallback consolidation method');
    
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
    
    const optimizedItems: OptimizedItem[] = Array.from(ingredientCounts.entries()).map(([name, data]) => ({
      nome: name.charAt(0).toUpperCase() + name.slice(1),
      quantidade: data.count > 2 ? `${data.count} units` : "1 unit",
      categoria: categorizeIngredient(name)
    }));
    
    console.log(`✅ Fallback optimization completed with ${optimizedItems.length} items`);
    
    return new Response(
      JSON.stringify({ optimizedItems }),
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

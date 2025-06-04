
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

    // Buscar a chave da API do Supabase Secrets
    const openaiApiKey = Deno.env.get('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')

    if (!openaiApiKey) {
      throw new Error('Chave da API OpenAI não configurada')
    }

    const todosIngredientes = [...(itensComprados || []), ...ingredientes].filter((item, index, arr) => arr.indexOf(item) === index)

    const prompt = `Você é um chef especialista em nutrição e culinária saudável. Crie uma receita COMPLETA e DETALHADA seguindo EXATAMENTE estas especificações:

INGREDIENTES DISPONÍVEIS: ${todosIngredientes.join(', ')}
TIPO DE REFEIÇÃO: ${tipoRefeicao}
OBJETIVO NUTRICIONAL: ${objetivo}
PREFERÊNCIAS ALIMENTARES: ${preferenciasAlimentares}
RESTRIÇÕES ALIMENTARES: ${restricoesAlimentares.join(', ')}
TEMPO DISPONÍVEL: ${tempoDisponivel} minutos

INSTRUÇÕES OBRIGATÓRIAS:
1. Use PRIORITARIAMENTE os ingredientes disponíveis listados
2. A receita deve ser adequada para ${tipoRefeicao.toLowerCase()}
3. Considere o objetivo nutricional: ${objetivo}
4. Respeite RIGOROSAMENTE as restrições alimentares
5. O tempo de preparo deve ser realista (máximo ${tempoDisponivel} minutos)
6. Forneça valores nutricionais precisos

FORMATO DE RESPOSTA (JSON válido):
{
  "nome": "Nome criativo e apetitoso da receita",
  "tempo": número_em_minutos,
  "calorias": número_total_calorias,
  "ingredientes": [
    "quantidade + unidade + ingrediente (ex: 2 xícaras de arroz integral)",
    "1 colher de sopa de azeite extra virgem"
  ],
  "preparo": [
    "Passo 1: Instrução detalhada do primeiro passo",
    "Passo 2: Instrução detalhada do segundo passo",
    "Passo 3: Continue até finalizar a receita"
  ],
  "proteinas": gramas_de_proteina,
  "carboidratos": gramas_de_carboidratos,
  "gorduras": gramas_de_gorduras
}

IMPORTANTE: 
- Responda APENAS com o JSON válido, sem explicações adicionais
- Seja específico nas quantidades e instruções
- A receita deve ser saborosa, nutritiva e fácil de fazer
- Use técnicas culinárias que preservem os nutrientes
- Considere combinações de sabores harmoniosas`

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
            content: 'Você é um chef especialista em nutrição que cria receitas saudáveis e balanceadas. Sempre responda apenas com JSON válido.'
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
      throw new Error(`Erro na API OpenAI: ${response.status}`)
    }

    const data = await response.json()
    const recipeText = data.choices[0].message.content

    try {
      const recipe = JSON.parse(recipeText)
      
      // Validar a estrutura da resposta
      if (!recipe.nome || !recipe.ingredientes || !recipe.preparo) {
        throw new Error('Resposta da API incompleta')
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
      console.error('Erro ao fazer parse da resposta:', recipeText)
      throw new Error('Formato de resposta inválido da API')
    }

  } catch (error) {
    console.error('Erro:', error)
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

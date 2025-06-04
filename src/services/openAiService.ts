
interface RecipeGenerationRequest {
  ingredientes: string[];
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  tipoRefeicao: string;
  objetivo: string;
  tempoDisponivel?: number;
  itensComprados?: string[];
}

interface RecipeResponse {
  nome: string;
  descricao: string;
  ingredientes: string[];
  preparo: string[];
  tempo: number;
  beneficios: string[];
  dicasExtras?: string[];
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
}

export class OpenAIService {
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  private static buildPrompt(request: RecipeGenerationRequest): string {
    const { ingredientes, preferenciasAlimentares, restricoesAlimentares, tipoRefeicao, objetivo, tempoDisponivel, itensComprados } = request;
    
    const todosIngredientes = [...ingredientes, ...(itensComprados || [])].filter((item, index, arr) => arr.indexOf(item) === index);
    
    return `
Identidade:
Você é um Chef e Nutricionista especializado em criar receitas personalizadas, saudáveis, práticas e saborosas, com foco em atender preferências alimentares, restrições nutricionais e objetivos específicos do usuário.

Missão:
Sua função é gerar receitas completas, detalhadas e personalizadas com base nas informações fornecidas pelo usuário na plataforma, levando em conta:

Ingredientes disponíveis
Preferências alimentares (ex.: vegano, low carb, proteico, sem glúten, etc.)
Restrições (ex.: alergias, intolerâncias, doenças específicas)
Tipo de refeição (ex.: café da manhã, almoço, lanche, jantar, sobremesa)
Objetivo nutricional ou de saúde (emagrecimento, ganho de massa muscular, manutenção, etc.)

Instruções:
Analise atentamente as entradas fornecidas pelo usuário.
Com base nas informações, crie uma receita exclusiva que atenda aos critérios informados.
Estruture a receita com as seguintes seções, sempre de forma clara, objetiva e motivadora:

🍽️ Nome da Receita:
Escolha um nome criativo, que destaque o apelo e o estilo da receita.

📝 Descrição:
Apresente um breve resumo, ressaltando os benefícios da receita, seu sabor, praticidade ou adequação às restrições e objetivos.

🛒 Ingredientes:
Liste todos os ingredientes necessários, com quantidades exatas e de forma clara.

🥣 Modo de Preparo:
Descreva o passo a passo de forma didática, simples e motivadora, para que o usuário consiga executar facilmente.

⏱️ Tempo de Preparo:
Informe o tempo médio necessário para realizar a receita.

🍀 Benefícios Nutricionais:
Liste de 2 a 4 benefícios principais relacionados à saúde, bem-estar ou praticidade da receita.

💡 Dicas Extras:
Se aplicável, adicione sugestões de substituições, variações ou técnicas que possam melhorar a experiência.

Estilo de Comunicação:
- Didático e acolhedor
- Profissional e confiável
- Simples e objetivo
- Estimulante, sempre encorajando o usuário a testar a receita

Restrições:
❌ Nunca indique ingredientes incompatíveis com as restrições informadas.
❌ Nunca sugira métodos de preparo perigosos ou não testados.
✅ Sempre adapte a receita para ser a mais prática possível, dentro das possibilidades indicadas.

DADOS DO USUÁRIO:
- Ingredientes: ${todosIngredientes.join(', ')}
- Preferências: ${preferenciasAlimentares}
- Restrições: ${restricoesAlimentares.join(', ') || 'nenhuma'}
- Tipo de refeição: ${tipoRefeicao}
- Objetivo: ${objetivo}
${tempoDisponivel ? `- Tempo disponível: ${tempoDisponivel} minutos` : ''}

IMPORTANTE: Além da receita formatada, inclua ao final uma seção JSON com informações nutricionais estimadas:
{
  "calorias": [valor numérico],
  "proteinas": [valor em gramas],
  "carboidratos": [valor em gramas],
  "gorduras": [valor em gramas]
}
`;
  }

  private static parseRecipeResponse(content: string): RecipeResponse {
    const lines = content.split('\n').filter(line => line.trim());
    
    let nome = '';
    let descricao = '';
    let ingredientes: string[] = [];
    let preparo: string[] = [];
    let tempo = 30;
    let beneficios: string[] = [];
    let dicasExtras: string[] = [];
    let calorias = 300;
    let proteinas = 15;
    let carboidratos = 25;
    let gorduras = 10;

    let currentSection = '';
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.includes('🍽️') || line.includes('Nome da Receita')) {
        currentSection = 'nome';
        nome = line.replace(/🍽️.*?:/g, '').trim();
      } else if (line.includes('📝') || line.includes('Descrição')) {
        currentSection = 'descricao';
        descricao = line.replace(/📝.*?:/g, '').trim();
      } else if (line.includes('🛒') || line.includes('Ingredientes')) {
        currentSection = 'ingredientes';
      } else if (line.includes('🥣') || line.includes('Modo de Preparo')) {
        currentSection = 'preparo';
      } else if (line.includes('⏱️') || line.includes('Tempo de Preparo')) {
        currentSection = 'tempo';
        const tempoMatch = line.match(/(\d+)/);
        if (tempoMatch) tempo = parseInt(tempoMatch[1]);
      } else if (line.includes('🍀') || line.includes('Benefícios')) {
        currentSection = 'beneficios';
      } else if (line.includes('💡') || line.includes('Dicas')) {
        currentSection = 'dicas';
      } else if (line.startsWith('{') && line.includes('calorias')) {
        try {
          const nutritionData = JSON.parse(line);
          calorias = nutritionData.calorias || calorias;
          proteinas = nutritionData.proteinas || proteinas;
          carboidratos = nutritionData.carboidratos || carboidratos;
          gorduras = nutritionData.gorduras || gorduras;
        } catch (e) {
          console.warn('Erro ao parsear dados nutricionais:', e);
        }
      } else if (line && !line.includes('🍽️') && !line.includes('📝') && !line.includes('🛒') && !line.includes('🥣') && !line.includes('⏱️') && !line.includes('🍀') && !line.includes('💡')) {
        switch (currentSection) {
          case 'nome':
            if (!nome) nome = line;
            break;
          case 'descricao':
            if (!descricao) descricao = line;
            break;
          case 'ingredientes':
            if (line.match(/^[-•]\s/) || line.match(/^\d+/)) {
              ingredientes.push(line.replace(/^[-•]\s/, ''));
            }
            break;
          case 'preparo':
            if (line.match(/^[-•]\s/) || line.match(/^\d+/)) {
              preparo.push(line.replace(/^[-•]\s/, ''));
            }
            break;
          case 'beneficios':
            if (line.match(/^[-•]\s/)) {
              beneficios.push(line.replace(/^[-•]\s/, ''));
            }
            break;
          case 'dicas':
            if (line.match(/^[-•]\s/)) {
              dicasExtras.push(line.replace(/^[-•]\s/, ''));
            }
            break;
        }
      }
    }

    return {
      nome: nome || 'Receita Personalizada',
      descricao: descricao || 'Uma receita criada especialmente para você',
      ingredientes,
      preparo,
      tempo,
      beneficios,
      dicasExtras,
      calorias,
      proteinas,
      carboidratos,
      gorduras
    };
  }

  static async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    if (!this.API_KEY) {
      throw new Error('Chave da API OpenAI não configurada. Configure VITE_OPENAI_API_KEY nas variáveis de ambiente.');
    }

    const prompt = this.buildPrompt(request);

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um Chef e Nutricionista especializado em criar receitas personalizadas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da API OpenAI');
      }

      return this.parseRecipeResponse(content);
    } catch (error) {
      console.error('Erro ao gerar receita com ChatGPT:', error);
      throw error;
    }
  }
}

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FiltrosReceitas } from "@/components/GeradorReceitas/FiltrosReceitas";
import { SelecaoIngredientes } from "@/components/GeradorReceitas/SelecaoIngredientes";
import { SugerirItemModal } from "@/components/GeradorReceitas/SugerirItemModal";
import ReceitaCard from "@/components/ColecaoReceitas/ReceitaCard";

interface Receita {
  id: string;
  nome: string;
  tempo: number;
  calorias: number;
  refeicao: string;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  favorita: boolean;
}

interface Ingrediente {
  nome: string;
  selecionado: boolean;
}

const GeradorReceitas = () => {
  const navigate = useNavigate();
  
  const [filtros, setFiltros] = useState({
    objetivo: "Perda de peso",
    preferencias: "",
    caloriesMax: [400]
  });

  const [ingredientesPorRefeicao, setIngredientesPorRefeicao] = useState({
    "Café da Manhã": [
      { nome: "Aveia", selecionado: true },
      { nome: "Banana", selecionado: true },
      { nome: "Ovos", selecionado: false },
      { nome: "Espinafre", selecionado: false },
      { nome: "Iogurte Natural", selecionado: true },
      { nome: "Chia", selecionado: false },
      { nome: "Frutas Vermelhas", selecionado: true }
    ],
    "Almoço": [
      { nome: "Peito de Frango", selecionado: true },
      { nome: "Quinoa", selecionado: true },
      { nome: "Brócolis", selecionado: true },
      { nome: "Azeite", selecionado: false },
      { nome: "Batata Doce", selecionado: false },
      { nome: "Salmão", selecionado: false },
      { nome: "Couve-flor", selecionado: true }
    ],
    "Lanche": [
      { nome: "Iogurte Natural", selecionado: true },
      { nome: "Oleaginosas", selecionado: true },
      { nome: "Frutas", selecionado: true },
      { nome: "Cottage", selecionado: false },
      { nome: "Abacate", selecionado: false }
    ],
    "Jantar": [
      { nome: "Tofu", selecionado: true },
      { nome: "Abobrinha", selecionado: true },
      { nome: "Berinjela", selecionado: false },
      { nome: "Cogumelos", selecionado: true },
      { nome: "Peixe Branco", selecionado: false },
      { nome: "Aspargos", selecionado: false }
    ]
  });

  const [receitasGeradas, setReceitasGeradas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [
      {
        id: "1",
        nome: "Bowl de Aveia com Frutas Vermelhas",
        tempo: 10,
        calorias: 320,
        refeicao: "Café da Manhã",
        ingredientes: ["Aveia", "Banana", "Frutas Vermelhas", "Iogurte Natural"],
        preparo: [
          "Misture a aveia com iogurte natural",
          "Adicione a banana cortada em fatias",
          "Finalize com as frutas vermelhas",
          "Sirva imediatamente"
        ],
        macros: { proteinas: 15, carboidratos: 45, gorduras: 8 },
        favorita: false
      }
    ],
    "Almoço": [
      {
        id: "2",
        nome: "Frango Grelhado com Quinoa e Brócolis",
        tempo: 25,
        calorias: 380,
        refeicao: "Almoço",
        ingredientes: ["Peito de Frango", "Quinoa", "Brócolis"],
        preparo: [
          "Tempere e grelhe o peito de frango",
          "Cozinhe a quinoa em água",
          "Refogue o brócolis no vapor",
          "Monte o prato e sirva"
        ],
        macros: { proteinas: 35, carboidratos: 30, gorduras: 10 },
        favorita: false
      }
    ],
    "Lanche": [
      {
        id: "3",
        nome: "Mix de Oleaginosas com Iogurte",
        tempo: 5,
        calorias: 200,
        refeicao: "Lanche",
        ingredientes: ["Iogurte Natural", "Oleaginosas", "Frutas"],
        preparo: [
          "Coloque o iogurte em uma tigela",
          "Adicione as oleaginosas",
          "Corte frutas e misture",
          "Consuma imediatamente"
        ],
        macros: { proteinas: 12, carboidratos: 18, gorduras: 12 },
        favorita: false
      }
    ],
    "Jantar": [
      {
        id: "4",
        nome: "Tofu Grelhado com Abobrinha",
        tempo: 20,
        calorias: 250,
        refeicao: "Jantar",
        ingredientes: ["Tofu", "Abobrinha", "Cogumelos"],
        preparo: [
          "Corte o tofu em fatias e tempere",
          "Grelhe o tofu até dourar",
          "Refogue a abobrinha com cogumelos",
          "Sirva quente"
        ],
        macros: { proteinas: 18, carboidratos: 12, gorduras: 14 },
        favorita: false
      }
    ]
  });

  const toggleIngrediente = (refeicao: string, indice: number) => {
    setIngredientesPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map((item, i) => 
        i === indice ? { ...item, selecionado: !item.selecionado } : item
      )
    }));
  };

  const toggleTodosIngredientes = (refeicao: string) => {
    const todosAtivos = ingredientesPorRefeicao[refeicao].every(item => item.selecionado);
    setIngredientesPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => ({ ...item, selecionado: !todosAtivos }))
    }));
  };

  const toggleFavorito = (refeicao: string, receitaId: string) => {
    setReceitasGeradas(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(receita => 
        receita.id === receitaId 
          ? { ...receita, favorita: !receita.favorita }
          : receita
      )
    }));
    
    const receita = receitasGeradas[refeicao].find(r => r.id === receitaId);
    if (receita) {
      toast.success(
        receita.favorita 
          ? "Removido dos favoritos" 
          : `'${receita.nome}' adicionado aos favoritos!`
      );
    }
  };

  const gerarNovasReceitas = (refeicao: string) => {
    const ingredientesSelecionados = ingredientesPorRefeicao[refeicao]
      .filter(item => item.selecionado)
      .map(item => item.nome);

    if (ingredientesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um ingrediente!");
      return;
    }

    toast.loading("Gerando receitas...", { duration: 2000 });
    
    setTimeout(() => {
      const novasReceitas: Receita[] = [
        {
          id: Date.now().toString(),
          nome: `Receita Saudável com ${ingredientesSelecionados[0]}`,
          tempo: Math.floor(Math.random() * 30) + 10,
          calorias: Math.floor(Math.random() * 200) + 200,
          refeicao,
          ingredientes: ingredientesSelecionados.slice(0, 4),
          preparo: [
            "Prepare os ingredientes",
            "Combine conforme a receita",
            "Cozinhe por alguns minutos",
            "Sirva quente"
          ],
          macros: {
            proteinas: Math.floor(Math.random() * 20) + 10,
            carboidratos: Math.floor(Math.random() * 30) + 15,
            gorduras: Math.floor(Math.random() * 15) + 5
          },
          favorita: false
        }
      ];

      setReceitasGeradas(prev => ({
        ...prev,
        [refeicao]: [...prev[refeicao], ...novasReceitas]
      }));

      toast.success("Novas receitas geradas!");
    }, 2000);
  };

  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Gerador de Receitas Saudáveis" breadcrumb={["Home", "Gerador de Receitas"]}>
      <div className="space-y-8">
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-6">
            <p className="text-white/80">
              As receitas abaixo foram geradas com base nos itens que você marcou em sua Lista de Compras. 
              Cada uma é balanceada para manter saciedade e apoiar seu emagrecimento.
            </p>
          </CardContent>
        </Card>

        <FiltrosReceitas
          objetivo={filtros.objetivo}
          preferencias={filtros.preferencias}
          caloriesMax={filtros.caloriesMax}
          onObjetivoChange={(value) => setFiltros(prev => ({ ...prev, objetivo: value }))}
          onPreferenciasChange={(value) => setFiltros(prev => ({ ...prev, preferencias: value }))}
          onCaloriesMaxChange={(value) => setFiltros(prev => ({ ...prev, caloriesMax: value }))}
        />

        {refeicoes.map((refeicao) => (
          <Card key={refeicao} className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-xl">{refeicao}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SelecaoIngredientes
                refeicao={refeicao}
                ingredientes={ingredientesPorRefeicao[refeicao]}
                onToggleIngrediente={(index) => toggleIngrediente(refeicao, index)}
                onToggleTodos={() => toggleTodosIngredientes(refeicao)}
              />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-white/80 font-medium">Receitas:</h4>
                  <Button
                    onClick={() => gerarNovasReceitas(refeicao)}
                    className="bg-neon-green text-black hover:bg-neon-green/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Mais Receitas
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {receitasGeradas[refeicao].map((receita) => (
                    <ReceitaCard
                      key={receita.id}
                      receita={receita}
                      onToggleFavorito={() => toggleFavorito(refeicao, receita.id)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/lista-compras")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver Lista de Compras
          </Button>

          <SugerirItemModal refeicoes={refeicoes} />
        </div>
      </div>
    </Layout>
  );
};

export default GeradorReceitas;

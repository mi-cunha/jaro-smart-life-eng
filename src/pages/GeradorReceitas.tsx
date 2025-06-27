
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bot } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiltrosReceitas } from "@/components/GeradorReceitas/FiltrosReceitas";
import { SugerirItemModal } from "@/components/GeradorReceitas/SugerirItemModal";
import { RefeicaoSection } from "@/components/GeradorReceitas/RefeicaoSection";
import { useReceitasGeradas } from "@/hooks/useReceitasGeradas";
import { useIngredientes } from "@/hooks/useIngredientes";
import { useIntegracaoListaReceitas } from "@/hooks/useIntegracaoListaReceitas";
import { Filtros } from "@/types/receitas";
import { useSupabasePreferencias } from "@/hooks/useSupabasePreferencias";

const GeradorReceitas = () => {
  const navigate = useNavigate();
  
  const [filtros, setFiltros] = useState<Filtros>({
    objetivo: "Weight loss",
    preferencias: "",
    caloriesMax: [400]
  });

  const { preferencias } = useSupabasePreferencias();

  const {
    ingredientesPorRefeicao,
    toggleIngrediente,
    toggleTodosIngredientes,
    getIngredientesSelecionados,
    adicionarIngrediente
  } = useIngredientes();

  const {
    receitasGeradas,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita,
    loading
  } = useReceitasGeradas();

  const {
    getItensCompradosPorRefeicao,
    hasItensComprados
  } = useIntegracaoListaReceitas();

  console.log('🍳 GeradorReceitas - Recipe generation active:', {
    preferencias: {
      alimentares: preferencias?.alimentares,
      restricoes: preferencias?.restricoes,
      objetivo: preferencias?.objetivo
    }
  });

  const handleGerarReceitas = (refeicao: string) => {
    const ingredientesSelecionados = getIngredientesSelecionados(refeicao);
    const itensComprados = getItensCompradosPorRefeicao(refeicao);
    
    console.log('🎯 GeradorReceitas - Starting recipe generation:', {
      refeicao,
      ingredientesSelecionados,
      itensComprados,
      preferencias: {
        alimentares: preferencias?.alimentares,
        restricoes: preferencias?.restricoes,
        objetivo: preferencias?.objetivo
      }
    });
    
    gerarNovasReceitas(
      refeicao, 
      ingredientesSelecionados, 
      itensComprados,
      preferencias?.alimentares || "nenhuma",
      preferencias?.restricoes || [],
      preferencias?.objetivo || "alimentação saudável"
    );
  };

  const handleAdicionarIngrediente = (refeicao: string, ingrediente: string) => {
    adicionarIngrediente(refeicao, ingrediente);
  };

  const refeicoes = ["Breakfast", "Lunch", "Snack", "Dinner"];

  return (
    <Layout title="Gerador de Receitas" breadcrumb={["Home", "Gerador de Receitas"]}>
      <div className="space-y-6 md:space-y-8 max-w-full overflow-hidden">
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-neon-green font-medium text-sm md:text-base block mb-2">
                    geração Inteligente de Receitas
                  </span>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    Gere receitas personalizadas baseadas nos seus ingredientes selecionados e itens comprados da sua Lista de Compras. 
                    Cada receita é adaptada às suas preferências e nutricionalmente equilibrada.
                  </p>
                  <p className="text-neon-green text-xs md:text-sm mt-2">
                    🍳 Crie variações ilimitadas com os mesmos ingredientes para diversidade nas refeições
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full">
          <FiltrosReceitas
            objetivo={filtros.objetivo}
            caloriesMax={filtros.caloriesMax}
            onObjetivoChange={(value) => setFiltros(prev => ({ ...prev, objetivo: value }))}
            onCaloriesMaxChange={(value) => setFiltros(prev => ({ ...prev, caloriesMax: value }))}
          />
        </div>

        <div className="space-y-6 md:space-y-8 w-full">
          {refeicoes.map((refeicao) => {
            const itensComprados = getItensCompradosPorRefeicao(refeicao);
            const temItensComprados = hasItensComprados(refeicao);

            return (
              <div key={refeicao} className="w-full">
                <RefeicaoSection
                  refeicao={refeicao}
                  ingredientes={ingredientesPorRefeicao[refeicao] || []}
                  receitas={receitasGeradas[refeicao] || []}
                  onToggleIngrediente={(index) => toggleIngrediente(refeicao, index)}
                  onToggleTodos={() => toggleTodosIngredientes(refeicao)}
                  onToggleFavorito={(receitaId) => toggleFavorito(refeicao, receitaId)}
                  onGerarReceitas={() => handleGerarReceitas(refeicao)}
                  onRemoverReceita={(receitaId) => removerReceita(refeicao, receitaId)}
                  onAddIngrediente={(ingrediente) => handleAdicionarIngrediente(refeicao, ingrediente)}
                  itensComprados={itensComprados}
                  temItensComprados={temItensComprados}
                  loading={loading}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => navigate("/lista-compras")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver Lista de Compras
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default GeradorReceitas;

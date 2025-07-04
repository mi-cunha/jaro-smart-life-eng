
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
      caloriesMax: filtros.caloriesMax[0],
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
      preferencias?.objetivo || "alimentação saudável",
      filtros.caloriesMax[0]
    );
  };

  const handleAdicionarIngrediente = (refeicao: string, ingrediente: string) => {
    adicionarIngrediente(refeicao, ingrediente);
  };

  const refeicoes = ["Breakfast", "Lunch", "Snack", "Dinner"];

  return (
    <Layout title="Recipe Generator" breadcrumb={["Home", "Recipe Generator"]}>
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden px-2 md:px-0">
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-neon-green flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-neon-green font-medium text-xs md:text-base block mb-1 md:mb-2">
                    Smart Recipe Generation
                  </span>
                  <p className="text-white/80 text-xs md:text-base leading-relaxed">
                    Generate personalized recipes based on your selected ingredients and purchased items from your Shopping List. 
                    Each recipe is adapted to your preferences and nutritionally balanced.
                  </p>
                  <p className="text-neon-green text-xs md:text-sm mt-1 md:mt-2">
                    🍳 Create unlimited variations with the same ingredients for meal diversity
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

        <div className="space-y-4 md:space-y-6 w-full">
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

        <div className="flex flex-col gap-3 w-full px-2 md:px-0">
          <Button
            onClick={() => navigate("/lista-compras")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto text-sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Shopping List
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default GeradorReceitas;

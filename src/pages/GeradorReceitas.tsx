
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiltrosReceitas } from "@/components/GeradorReceitas/FiltrosReceitas";
import { SugerirItemModal } from "@/components/GeradorReceitas/SugerirItemModal";
import { RefeicaoSection } from "@/components/GeradorReceitas/RefeicaoSection";
import { useReceitasGeradas } from "@/hooks/useReceitasGeradas";
import { useIngredientes } from "@/hooks/useIngredientes";
import { useIntegracaoListaReceitas } from "@/hooks/useIntegracaoListaReceitas";
import { Filtros } from "@/types/receitas";
import { ConfiguracaoIA } from "@/components/GeradorReceitas/ConfiguracaoIA";
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
    useAI,
    setUseAI
  } = useReceitasGeradas();

  const {
    getItensCompradosPorRefeicao,
    hasItensComprados
  } = useIntegracaoListaReceitas();

  const handleGerarReceitas = (refeicao: string) => {
    const ingredientesSelecionados = getIngredientesSelecionados(refeicao);
    const itensComprados = getItensCompradosPorRefeicao(refeicao);
    
    console.log('🎯 Enviando preferências para geração de receitas:', {
      alimentares: preferencias?.alimentares,
      restricoes: preferencias?.restricoes,
      objetivo: preferencias?.objetivo
    });
    
    // Prioritize purchased items from shopping list
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
    <Layout title="Smart Recipe Generator" breadcrumb={["Home", "Recipe Generator"]}>
      <div className="space-y-8">
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 mb-2">
                  Recipes are generated based on selected ingredients and purchased items from your Shopping List. 
                  Each recipe is nutritionally balanced and recommended by health professionals.
                </p>
                {useAI && (
                  <p className="text-neon-green text-sm">
                    🤖 AI mode active - OpenAI-powered personalized recipes
                  </p>
                )}
              </div>
              <ConfiguracaoIA 
                useAI={useAI}
                onToggleAI={setUseAI}
              />
            </div>
          </CardContent>
        </Card>

        <FiltrosReceitas
          objetivo={filtros.objetivo}
          caloriesMax={filtros.caloriesMax}
          onObjetivoChange={(value) => setFiltros(prev => ({ ...prev, objetivo: value }))}
          onCaloriesMaxChange={(value) => setFiltros(prev => ({ ...prev, caloriesMax: value }))}
        />

        {refeicoes.map((refeicao) => {
          const itensComprados = getItensCompradosPorRefeicao(refeicao);
          const temItensComprados = hasItensComprados(refeicao);

          return (
            <RefeicaoSection
              key={refeicao}
              refeicao={refeicao}
              ingredientes={ingredientesPorRefeicao[refeicao] || []}
              receitas={receitasGeradas[refeicao] || []}
              onToggleIngrediente={(index) => toggleIngrediente(refeicao, index)}
              onToggleTodos={() => toggleTodosIngredientes(refeicao)}
              onToggleFavorito={(receitaId) => toggleFavorito(refeicao, receitaId)}
              onGerarReceitas={() => handleGerarReceitas(refeicao)}
              onRemoverReceita={(receitaId) => removerReceita(refeicao, receitaId)}
              itensComprados={itensComprados}
              temItensComprados={temItensComprados}
            />
          );
        })}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/lista-compras")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Shopping List
          </Button>

          <SugerirItemModal 
            refeicoes={refeicoes}
            onAddIngrediente={handleAdicionarIngrediente}
          />
        </div>
      </div>
    </Layout>
  );
};

export default GeradorReceitas;

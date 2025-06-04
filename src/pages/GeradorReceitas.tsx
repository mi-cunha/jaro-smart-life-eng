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
    objetivo: "Perda de peso",
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
    
    // Prioriza itens comprados da lista de compras
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

  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Gerador de Receitas Saudáveis" breadcrumb={["Home", "Gerador de Receitas"]}>
      <div className="space-y-8">
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 mb-2">
                  As receitas são geradas com base nos ingredientes selecionados e nos itens comprados da sua Lista de Compras. 
                  Cada receita é balanceada nutricionalmente e recomendada por profissionais da área.
                </p>
                {useAI && (
                  <p className="text-neon-green text-sm">
                    🤖 Modo ChatGPT ativo - Receitas personalizadas com IA
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
              ingredientes={ingredientesPorRefeicao[refeicao]}
              receitas={receitasGeradas[refeicao]}
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
            Ver Lista de Compras
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

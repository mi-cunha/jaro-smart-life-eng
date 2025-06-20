
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListaComprasStats } from "@/components/ListaCompras/ListaComprasStats";
import { TabelaItensRefeicao } from "@/components/ListaCompras/TabelaItensRefeicao";
import { EstatisticasRefeicao } from "@/components/ListaCompras/EstatisticasRefeicao";
import { ConfiguracoesPessoais } from "@/components/ListaCompras/ConfiguracoesPessoais";
import { ResumoCompra } from "@/components/ListaCompras/ResumoCompra";
import { DicasCompra } from "@/components/ListaCompras/DicasCompra";
import { GerarListaModal } from "@/components/ListaCompras/GerarListaModal";
import { SugerirItemModal } from "@/components/GeradorReceitas/SugerirItemModal";
import { useListaCompras } from "@/hooks/useListaCompras";

const ListaCompras = () => {
  const navigate = useNavigate();
  
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState("none");
  const [restricoesAlimentares, setRestricoesAlimentares] = useState<string[]>([]);
  
  const {
    itensPorRefeicao,
    toggleItem,
    toggleTodosItens,
    updatePreco,
    calcularTotalRefeicao,
    calcularTotalGeral,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido,
    removerItem,
    removerItensSelecionados
  } = useListaCompras();

  const refeicoes = ["Breakfast", "Lunch", "Snack", "Dinner"];

  return (
    <Layout title="Smart Shopping List" breadcrumb={["Home", "Shopping List"]}>
      <div className="space-y-8">
        <ConfiguracoesPessoais
          preferenciasAlimentares={preferenciasAlimentares}
          setPreferenciasAlimentares={setPreferenciasAlimentares}
          restricoesAlimentares={restricoesAlimentares}
          setRestricoesAlimentares={setRestricoesAlimentares}
        />

        <ListaComprasStats
          totalGeral={calcularTotalGeral()}
          onExportar={exportarLista}
          onVoltarReceitas={() => navigate("/gerador-receitas")}
        />

        <Tabs defaultValue="Breakfast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-dark-bg border border-white/10">
            {refeicoes.map((refeicao) => (
              <TabsTrigger
                key={refeicao}
                value={refeicao}
                className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white"
              >
                {refeicao}
              </TabsTrigger>
            ))}
          </TabsList>

          {refeicoes.map((refeicao) => {
            const itensRefeicao = itensPorRefeicao[refeicao] || [];
            const itensSelecionados = itensRefeicao.filter(item => item.comprado);
            const temItensSelecionados = itensSelecionados.length > 0;

            return (
              <TabsContent key={refeicao} value={refeicao} className="space-y-4">
                <Card className="bg-dark-bg border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-neon-green" />
                        {refeicao}
                      </CardTitle>
                      <div className="flex gap-2">
                        <GerarListaModal
                          refeicao={refeicao}
                          preferenciasAlimentares={preferenciasAlimentares}
                          restricoesAlimentares={restricoesAlimentares}
                          onAddItens={(itens) => adicionarItensGerados(refeicao, itens)}
                        />
                        <SugerirItemModal
                          refeicoes={[refeicao]}
                          onAddIngrediente={(refeicaoSelecionada, item) => adicionarItemSugerido(refeicaoSelecionada, item)}
                        />
                        <Button
                          onClick={() => toggleTodosItens(refeicao)}
                          variant="outline"
                          size="sm"
                          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                        >
                          Select/Unselect All
                        </Button>
                        {temItensSelecionados && (
                          <Button
                            onClick={() => removerItensSelecionados(refeicao)}
                            variant="outline"
                            size="sm"
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-neon-green font-medium">
                      Estimated total: ${calcularTotalRefeicao(refeicao).toFixed(2)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TabelaItensRefeicao
                      itens={itensRefeicao}
                      onToggleItem={(itemId) => toggleItem(refeicao, itemId)}
                      onRemoverItem={(itemId) => removerItem(refeicao, itemId)}
                      onUpdatePreco={(itemId, novoPreco) => updatePreco(refeicao, itemId, novoPreco)}
                    />

                    <EstatisticasRefeicao itens={itensRefeicao} />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <ResumoCompra
          refeicoes={refeicoes}
          calcularTotalRefeicao={calcularTotalRefeicao}
          calcularTotalGeral={calcularTotalGeral}
          itensPorRefeicao={itensPorRefeicao}
        />

        <DicasCompra />
      </div>
    </Layout>
  );
};

export default ListaCompras;

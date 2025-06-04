
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
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
  
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState("nenhuma");
  const [restricoesAlimentares, setRestricoesAlimentares] = useState<string[]>([]);
  
  const {
    itensPorRefeicao,
    toggleItem,
    toggleTodosItens,
    calcularTotalRefeicao,
    calcularTotalGeral,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido
  } = useListaCompras();

  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Lista de Compras Inteligente" breadcrumb={["Home", "Lista de Compras"]}>
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

        <Tabs defaultValue="Café da Manhã" className="w-full">
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

          {refeicoes.map((refeicao) => (
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
                        Selecionar/Desmarcar Todos
                      </Button>
                    </div>
                  </div>
                  <div className="text-neon-green font-medium">
                    Total estimado: R$ {calcularTotalRefeicao(refeicao).toFixed(2)}
                  </div>
                </CardHeader>
                <CardContent>
                  <TabelaItensRefeicao
                    itens={itensPorRefeicao[refeicao]}
                    onToggleItem={(itemId) => toggleItem(refeicao, itemId)}
                  />

                  <EstatisticasRefeicao itens={itensPorRefeicao[refeicao]} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
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

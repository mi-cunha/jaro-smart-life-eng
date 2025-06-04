
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ListaComprasStats } from "@/components/ListaCompras/ListaComprasStats";
import { TabelaItensRefeicao } from "@/components/ListaCompras/TabelaItensRefeicao";
import { EstatisticasRefeicao } from "@/components/ListaCompras/EstatisticasRefeicao";
import { RestrictionsModal } from "@/components/RestrictionsModal";
import { GerarListaModal } from "@/components/ListaCompras/GerarListaModal";

interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  comprado: boolean;
}

const ListaCompras = () => {
  const navigate = useNavigate();
  
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState("nenhuma");
  const [restricoesAlimentares, setRestricoesAlimentares] = useState<string[]>([]);
  
  const [itensPorRefeicao, setItensPorRefeicao] = useState<{ [key: string]: ItemCompra[] }>({
    "Café da Manhã": [
      { id: "1", nome: "Aveia em Flocos", quantidade: "500g", preco: 4.50, comprado: false },
      { id: "2", nome: "Banana Prata", quantidade: "1kg", preco: 3.20, comprado: true },
      { id: "3", nome: "Ovos Orgânicos", quantidade: "12 unidades", preco: 8.90, comprado: false },
      { id: "4", nome: "Iogurte Natural", quantidade: "500ml", preco: 6.80, comprado: false },
      { id: "5", nome: "Chia", quantidade: "200g", preco: 12.50, comprado: true },
      { id: "6", nome: "Frutas Vermelhas", quantidade: "300g", preco: 15.90, comprado: false },
      { id: "7", nome: "Mel Orgânico", quantidade: "250ml", preco: 18.00, comprado: false }
    ],
    "Almoço": [
      { id: "8", nome: "Peito de Frango", quantidade: "1kg", preco: 14.90, comprado: false },
      { id: "9", nome: "Quinoa", quantidade: "500g", preco: 12.80, comprado: true },
      { id: "10", nome: "Brócolis", quantidade: "500g", preco: 4.20, comprado: false },
      { id: "11", nome: "Azeite Extra Virgem", quantidade: "500ml", preco: 16.50, comprado: false },
      { id: "12", nome: "Batata Doce", quantidade: "1kg", preco: 5.80, comprado: true },
      { id: "13", nome: "Salmão", quantidade: "500g", preco: 28.90, comprado: false },
      { id: "14", nome: "Couve-flor", quantidade: "1 unidade", preco: 3.50, comprado: false }
    ],
    "Lanche": [
      { id: "15", nome: "Castanha do Pará", quantidade: "200g", preco: 18.90, comprado: false },
      { id: "16", nome: "Amêndoas", quantidade: "200g", preco: 22.50, comprado: true },
      { id: "17", nome: "Maçã Gala", quantidade: "1kg", preco: 6.90, comprado: false },
      { id: "18", nome: "Queijo Cottage", quantidade: "200g", preco: 8.40, comprado: false },
      { id: "19", nome: "Abacate", quantidade: "2 unidades", preco: 7.80, comprado: false }
    ],
    "Jantar": [
      { id: "20", nome: "Tofu", quantidade: "300g", preco: 9.80, comprado: false },
      { id: "21", nome: "Abobrinha", quantidade: "500g", preco: 3.90, comprado: true },
      { id: "22", nome: "Berinjela", quantidade: "500g", preco: 4.60, comprado: false },
      { id: "23", nome: "Cogumelos", quantidade: "300g", preco: 8.50, comprado: false },
      { id: "24", nome: "Peixe Branco", quantidade: "500g", preco: 19.90, comprado: false },
      { id: "25", nome: "Aspargos", quantidade: "300g", preco: 12.80, comprado: true }
    ]
  });

  const toggleItem = (refeicao: string, itemId: string) => {
    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => {
        if (item.id === itemId) {
          const novoStatus = !item.comprado;
          if (novoStatus) {
            toast.success(`'${item.nome}' marcado como comprado! ✅`);
          }
          return { ...item, comprado: novoStatus };
        }
        return item;
      })
    }));
  };

  const toggleTodosItens = (refeicao: string) => {
    const todosComprados = itensPorRefeicao[refeicao].every(item => item.comprado);
    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => ({ ...item, comprado: !todosComprados }))
    }));
    
    toast.success(todosComprados ? "Todos os itens desmarcados" : "Todos os itens marcados como comprados!");
  };

  const calcularTotalRefeicao = (refeicao: string) => {
    return itensPorRefeicao[refeicao].reduce((total, item) => total + item.preco, 0);
  };

  const calcularTotalGeral = () => {
    return Object.values(itensPorRefeicao).flat().reduce((total, item) => total + item.preco, 0);
  };

  const exportarLista = () => {
    const dadosExport = Object.entries(itensPorRefeicao).map(([refeicao, itens]) => ({
      refeicao,
      itens: itens.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        comprado: item.comprado ? "Sim" : "Não"
      })),
      total: calcularTotalRefeicao(refeicao)
    }));

    console.log("Exportando lista:", dadosExport);
    toast.success("Lista exportada com sucesso! 📊");
  };

  const adicionarItensGerados = (refeicao: string, novosItens: any[]) => {
    const itensConvertidos = novosItens.map(item => ({
      id: Date.now().toString() + Math.random().toString(36),
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
      comprado: false
    }));

    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: [...prev[refeicao], ...itensConvertidos]
    }));
  };

  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Lista de Compras Inteligente" breadcrumb={["Home", "Lista de Compras"]}>
      <div className="space-y-8">
        {/* Configurações */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Configurações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Preferências Alimentares</label>
                <Select value={preferenciasAlimentares} onValueChange={setPreferenciasAlimentares}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-white/20">
                    <SelectItem value="nenhuma">Nenhuma preferência</SelectItem>
                    <SelectItem value="vegetariano">Vegetariano</SelectItem>
                    <SelectItem value="vegano">Vegano</SelectItem>
                    <SelectItem value="low-carb">Low Carb</SelectItem>
                    <SelectItem value="cetogenico">Cetogênico</SelectItem>
                    <SelectItem value="mediterraneo">Mediterrâneo</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="sem-gluten">Sem Glúten</SelectItem>
                    <SelectItem value="sem-lactose">Sem Lactose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <RestrictionsModal 
                  restrictions={restricoesAlimentares}
                  onUpdate={setRestricoesAlimentares}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Resumo da Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {refeicoes.map((refeicao) => (
                <div key={refeicao} className="text-center">
                  <div className="text-lg font-bold text-neon-green">
                    R$ {calcularTotalRefeicao(refeicao).toFixed(2)}
                  </div>
                  <div className="text-sm text-white/70">{refeicao}</div>
                  <div className="text-xs text-white/50 mt-1">
                    {itensPorRefeicao[refeicao].filter(item => item.comprado).length}/{itensPorRefeicao[refeicao].length} itens
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                R$ {calcularTotalGeral().toFixed(2)}
              </div>
              <div className="text-white/70">Total estimado da compra completa</div>
              <div className="text-sm text-white/50 mt-1">
                {Object.values(itensPorRefeicao).flat().filter(item => item.comprado).length}/
                {Object.values(itensPorRefeicao).flat().length} itens comprados
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              💡 Dicas de Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-white/80">• Compre produtos orgânicos quando possível para maximizar os nutrientes</p>
            <p className="text-white/80">• Prefira frutas e vegetais da estação para economizar</p>
            <p className="text-white/80">• Verifique as datas de validade, especialmente dos perecíveis</p>
            <p className="text-white/80">• Considere comprar alguns itens em maior quantidade se houver promoção</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ListaCompras;

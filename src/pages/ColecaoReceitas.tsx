import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Clock, Trash2, History, ChefHat, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ReceitaDetalhesModal } from "@/components/GeradorReceitas/ReceitaDetalhesModal";

interface ReceitaFavorita {
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
  dataAdicionada: string;
  favorita: boolean;
}

interface HistoricoGeracao {
  id: string;
  data: string;
  hora: string;
  quantidadeReceitas: number;
  refeicao: string;
  receitas: ReceitaCompleta[];
}

interface ReceitaCompleta {
  nome: string;
  tempo: number;
  calorias: number;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
}

const ColecaoReceitas = () => {
  const navigate = useNavigate();
  const [receitaDetalhes, setReceitaDetalhes] = useState<ReceitaFavorita | null>(null);
  
  const [receitasFavoritas, setReceitasFavoritas] = useState<{ [key: string]: ReceitaFavorita[] }>({
    "Café da Manhã": [
      {
        id: "fav1",
        nome: "Bowl de Aveia com Frutas Vermelhas",
        tempo: 10,
        calorias: 320,
        refeicao: "Café da Manhã",
        ingredientes: ["Aveia", "Banana", "Frutas Vermelhas", "Iogurte Natural", "Mel"],
        preparo: [
          "Misture a aveia com iogurte natural",
          "Adicione a banana cortada em fatias",
          "Finalize com as frutas vermelhas",
          "Adicione mel a gosto e sirva"
        ],
        macros: { proteinas: 15, carboidratos: 45, gorduras: 8 },
        dataAdicionada: "15/02/2024",
        favorita: true
      },
      {
        id: "fav2",
        nome: "Panqueca de Banana e Aveia",
        tempo: 15,
        calorias: 280,
        refeicao: "Café da Manhã",
        ingredientes: ["Banana", "Aveia", "Ovos", "Canela"],
        preparo: [
          "Amasse a banana com um garfo",
          "Misture com aveia, ovos e canela",
          "Aqueça a frigideira antiaderente",
          "Despeje a massa e cozinhe dos dois lados"
        ],
        macros: { proteinas: 12, carboidratos: 35, gorduras: 9 },
        dataAdicionada: "12/02/2024",
        favorita: true
      }
    ],
    "Almoço": [
      {
        id: "fav3",
        nome: "Frango Grelhado com Quinoa e Brócolis",
        tempo: 25,
        calorias: 380,
        refeicao: "Almoço",
        ingredientes: ["Peito de Frango", "Quinoa", "Brócolis", "Azeite", "Alho"],
        preparo: [
          "Tempere e grelhe o peito de frango",
          "Cozinhe a quinoa em água com sal",
          "Refogue o brócolis com alho e azeite",
          "Monte o prato e sirva quente"
        ],
        macros: { proteinas: 35, carboidratos: 30, gorduras: 10 },
        dataAdicionada: "14/02/2024",
        favorita: true
      }
    ],
    "Lanche": [
      {
        id: "fav4",
        nome: "Mix de Oleaginosas com Iogurte",
        tempo: 5,
        calorias: 200,
        refeicao: "Lanche",
        ingredientes: ["Iogurte Natural", "Castanhas", "Amêndoas", "Nozes"],
        preparo: [
          "Coloque o iogurte em uma tigela",
          "Adicione o mix de oleaginosas",
          "Misture delicadamente",
          "Consuma imediatamente"
        ],
        macros: { proteinas: 12, carboidratos: 18, gorduras: 12 },
        dataAdicionada: "13/02/2024",
        favorita: true
      }
    ],
    "Jantar": []
  });

  const [historicoGeracao, setHistoricoGeracao] = useState<HistoricoGeracao[]>([
    {
      id: "hist1",
      data: "15/02/2024",
      hora: "19:30",
      quantidadeReceitas: 3,
      refeicao: "Jantar",
      receitas: [
        {
          nome: "Tofu Grelhado com Legumes",
          tempo: 20,
          calorias: 250,
          ingredientes: ["Tofu", "Abobrinha", "Cogumelos", "Azeite"],
          preparo: ["Corte o tofu", "Grelhe até dourar", "Refogue os legumes", "Sirva quente"],
          macros: { proteinas: 18, carboidratos: 12, gorduras: 14 }
        },
        {
          nome: "Salmão com Aspargos",
          tempo: 25,
          calorias: 320,
          ingredientes: ["Salmão", "Aspargos", "Limão", "Ervas"],
          preparo: ["Tempere o salmão", "Asse no forno", "Cozinhe aspargos no vapor", "Finalize com limão"],
          macros: { proteinas: 28, carboidratos: 8, gorduras: 18 }
        }
      ]
    },
    {
      id: "hist2",
      data: "14/02/2024",
      hora: "12:15",
      quantidadeReceitas: 2,
      refeicao: "Almoço",
      receitas: [
        {
          nome: "Frango com Batata Doce",
          tempo: 30,
          calorias: 380,
          ingredientes: ["Frango", "Batata Doce", "Brócolis"],
          preparo: ["Grelhe o frango", "Asse a batata doce", "Refogue o brócolis", "Monte o prato"],
          macros: { proteinas: 35, carboidratos: 30, gorduras: 10 }
        }
      ]
    }
  ]);

  const removerFavorito = (refeicao: string, receitaId: string) => {
    setReceitasFavoritas(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].filter(receita => receita.id !== receitaId)
    }));
    toast.success("Receita removida dos favoritos");
  };

  const limparHistorico = () => {
    setHistoricoGeracao([]);
    toast.success("Histórico limpo com sucesso!");
  };

  const totalFavoritas = Object.values(receitasFavoritas).flat().length;
  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Coleção de Receitas" breadcrumb={["Home", "Coleção de Receitas"]}>
      <div className="space-y-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {totalFavoritas}
              </div>
              <div className="text-white/70">Receitas Favoritas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {historicoGeracao.length}
              </div>
              <div className="text-white/70">Sessões de Geração</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {historicoGeracao.reduce((total, item) => total + item.quantidadeReceitas, 0)}
              </div>
              <div className="text-white/70">Total de Receitas Geradas</div>
            </CardContent>
          </Card>
        </div>

        {/* Abas Principais */}
        <Tabs defaultValue="favoritas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-white/10">
            <TabsTrigger
              value="favoritas"
              className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favoritas ({totalFavoritas})
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico de Geração
            </TabsTrigger>
          </TabsList>

          {/* Seção Favoritas */}
          <TabsContent value="favoritas" className="space-y-6">
            {totalFavoritas === 0 ? (
              <Card className="bg-dark-bg border-white/10">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhuma receita favorita ainda
                  </h3>
                  <p className="text-white/60 mb-6">
                    Comece a favoritar receitas no Gerador de Receitas para vê-las aqui!
                  </p>
                  <Button
                    onClick={() => navigate("/gerador-receitas")}
                    className="bg-neon-green text-black hover:bg-neon-green/90"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Ir para Gerador de Receitas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {refeicoes.map((refeicao) => (
                  <AccordionItem
                    key={refeicao}
                    value={refeicao}
                    className="bg-dark-bg border border-white/10 rounded-lg"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{refeicao}</span>
                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                          {receitasFavoritas[refeicao].length} receitas
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {receitasFavoritas[refeicao].length === 0 ? (
                        <p className="text-white/60 text-center py-8">
                          Nenhuma receita favorita para {refeicao.toLowerCase()}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {receitasFavoritas[refeicao].map((receita) => (
                            <Card key={receita.id} className="bg-white/5 border-white/10">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-white text-lg">{receita.nome}</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removerFavorito(refeicao, receita.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {receita.tempo} min
                                  </Badge>
                                  <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                    {receita.calorias} kcal
                                  </Badge>
                                </div>
                                <div className="text-xs text-white/50">
                                  Favoritada em {receita.dataAdicionada}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <h5 className="text-white/80 text-sm font-medium mb-1">Macros:</h5>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.proteinas}g</div>
                                      <div className="text-white/60">Proteínas</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.carboidratos}g</div>
                                      <div className="text-white/60">Carboidratos</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.gorduras}g</div>
                                      <div className="text-white/60">Gorduras</div>
                                    </div>
                                  </div>
                                </div>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                                    >
                                      Ver Receita Completa
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-dark-bg border-white/10 max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">{receita.nome}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="flex gap-4">
                                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {receita.tempo} min
                                        </Badge>
                                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                          {receita.calorias} kcal
                                        </Badge>
                                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                                          {receita.refeicao}
                                        </Badge>
                                      </div>

                                      <div>
                                        <h4 className="text-white font-medium mb-2">Ingredientes:</h4>
                                        <ul className="space-y-1">
                                          {receita.ingredientes.map((ingrediente, index) => (
                                            <li key={index} className="text-white/80 flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                              {ingrediente}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <h4 className="text-white font-medium mb-2">Modo de Preparo:</h4>
                                        <ol className="space-y-2">
                                          {receita.preparo.map((passo, index) => (
                                            <li key={index} className="text-white/80 flex gap-3">
                                              <span className="text-neon-green font-bold">{index + 1}.</span>
                                              {passo}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* Seção Histórico Atualizada */}
          <TabsContent value="historico" className="space-y-6">
            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Histórico de Geração</CardTitle>
                  {historicoGeracao.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Histórico
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-dark-bg border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Confirmar Limpeza</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-white/80">
                            Tem certeza que deseja apagar todo o histórico de geração? Esta ação não pode ser desfeita.
                          </p>
                          <div className="flex gap-4">
                            <Button
                              onClick={limparHistorico}
                              className="bg-red-600 text-white hover:bg-red-700 flex-1"
                            >
                              Sim, limpar histórico
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Cancelar
                              </Button>
                            </DialogTrigger>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {historicoGeracao.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Nenhum histórico encontrado
                    </h3>
                    <p className="text-white/60">
                      O histórico de geração foi limpo ou você ainda não gerou receitas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historicoGeracao.map((item) => (
                      <Card key={item.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-white font-medium">
                                {item.data} às {item.hora}
                              </div>
                              <div className="text-sm text-white/60">
                                {item.quantidadeReceitas} receitas geradas para {item.refeicao}
                              </div>
                            </div>
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              {item.refeicao}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {item.receitas.map((receita, index) => (
                              <Card key={index} className="bg-white/5 border-white/10">
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-white text-sm font-medium">{receita.nome}</h5>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setReceitaDetalhes({
                                        ...receita,
                                        id: `hist-${index}`,
                                        refeicao: item.refeicao,
                                        dataAdicionada: item.data,
                                        favorita: false
                                      })}
                                      className="p-1 h-6 w-6"
                                    >
                                      <Eye className="w-3 h-3 text-neon-green" />
                                    </Button>
                                  </div>
                                  <div className="flex gap-2 mb-2">
                                    <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs">
                                      <Clock className="w-2 h-2 mr-1" />
                                      {receita.tempo}min
                                    </Badge>
                                    <Badge variant="outline" className="border-orange-400/30 text-orange-400 text-xs">
                                      {receita.calorias} kcal
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 text-xs">
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.proteinas}g</div>
                                      <div className="text-white/60">Prot.</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.carboidratos}g</div>
                                      <div className="text-white/60">Carb.</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{receita.macros.gorduras}g</div>
                                      <div className="text-white/60">Gord.</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/gerador-receitas")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Gerar Novas Receitas
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Voltar ao Home
          </Button>
        </div>
      </div>

      <ReceitaDetalhesModal
        receita={receitaDetalhes}
        isOpen={!!receitaDetalhes}
        onClose={() => setReceitaDetalhes(null)}
      />
    </Layout>
  );
};

export default ColecaoReceitas;

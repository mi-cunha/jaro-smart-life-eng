
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ChefHat, Clock, Heart, ShoppingCart, Plus, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  const [novoItem, setNovoItem] = useState({ nome: "", refeicao: "" });

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

    // Simular geração de receitas (aqui seria a chamada para a API do ChatGPT)
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

  const avaliarItem = async () => {
    if (!novoItem.nome || !novoItem.refeicao) {
      toast.error("Preencha todos os campos!");
      return;
    }

    toast.loading("Avaliando item...", { duration: 2000 });
    
    // Simular resposta da IA
    setTimeout(() => {
      const adequado = Math.random() > 0.3; // 70% chance de ser adequado
      
      if (adequado) {
        toast.success(`✔ Sim, '${novoItem.nome}' é recomendado para ${novoItem.refeicao}.`);
      } else {
        toast.error(`✖ Não recomendamos '${novoItem.nome}'. Use 'Quinoa' em vez disso.`);
      }
      
      setNovoItem({ nome: "", refeicao: "" });
    }, 2000);
  };

  const refeicoes = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];

  return (
    <Layout title="Gerador de Receitas Saudáveis" breadcrumb={["Home", "Gerador de Receitas"]}>
      <div className="space-y-8">
        {/* Texto Explicativo */}
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="p-6">
            <p className="text-white/80">
              As receitas abaixo foram geradas com base nos itens que você marcou em sua Lista de Compras. 
              Cada uma é balanceada para manter saciedade e apoiar seu emagrecimento.
            </p>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Objetivo</label>
                <Select value={filtros.objetivo} onValueChange={(value) => setFiltros(prev => ({ ...prev, objetivo: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-white/20">
                    <SelectItem value="Perda de peso">Perda de peso</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Ganho de massa">Ganho de massa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Preferências Alimentares</label>
                <Select value={filtros.preferencias} onValueChange={(value) => setFiltros(prev => ({ ...prev, preferencias: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-white/20">
                    <SelectItem value="vegano">Vegano</SelectItem>
                    <SelectItem value="low-carb">Low Carb</SelectItem>
                    <SelectItem value="sem-gluten">Sem Glúten</SelectItem>
                    <SelectItem value="vegetariano">Vegetariano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Calorias Máx.: {filtros.caloriesMax[0]} kcal
                </label>
                <Slider
                  value={filtros.caloriesMax}
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, caloriesMax: value }))}
                  max={800}
                  min={200}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seções por Refeição */}
        {refeicoes.map((refeicao) => (
          <Card key={refeicao} className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-xl">{refeicao}</CardTitle>
              <Button
                onClick={() => toggleTodosIngredientes(refeicao)}
                variant="outline"
                size="sm"
                className="w-fit border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                Selecionar/Desmarcar Todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de Ingredientes */}
              <div>
                <h4 className="text-white/80 font-medium mb-3">Ingredientes Disponíveis:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ingredientesPorRefeicao[refeicao].map((ingrediente, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={ingrediente.selecionado}
                        onCheckedChange={() => toggleIngrediente(refeicao, index)}
                        className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                      />
                      <label className="text-white/80 text-sm">{ingrediente.nome}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receitas Geradas */}
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
                    <Card key={receita.id} className="bg-white/5 border-white/10 hover:border-neon-green/30 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white text-lg">{receita.nome}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorito(refeicao, receita.id)}
                            className={receita.favorita ? "text-red-400" : "text-white/40 hover:text-red-400"}
                          >
                            <Heart className={`w-4 h-4 ${receita.favorita ? "fill-current" : ""}`} />
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
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="text-white/80 text-sm font-medium mb-1">Ingredientes:</h5>
                          <div className="text-white/60 text-xs">
                            {receita.ingredientes.join(", ")}
                          </div>
                        </div>

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
                              Ver Detalhes
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
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/lista-compras")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver Lista de Compras
          </Button>

          {/* Modal Sugerir Item */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-neon-green text-black hover:bg-neon-green/90 flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Sugerir Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-bg border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Sugerir Novo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Nome do Item</label>
                  <Input
                    value={novoItem.nome}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Quinoa Preta"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Refeição</label>
                  <Select value={novoItem.refeicao} onValueChange={(value) => setNovoItem(prev => ({ ...prev, refeicao: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Selecione a refeição..." />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-white/20">
                      {refeicoes.map((refeicao) => (
                        <SelectItem key={refeicao} value={refeicao}>{refeicao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={avaliarItem}
                  className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                >
                  Avaliar Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default GeradorReceitas;

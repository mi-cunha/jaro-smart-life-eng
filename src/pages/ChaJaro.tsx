
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Thermometer, Droplets, Leaf, CheckCircle, Info, Zap, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ChaJaro = () => {
  const [consumoHoje, setConsumoHoje] = useState(2);
  const metaDiaria = 3;
  const progressoConsumo = (consumoHoje / metaDiaria) * 100;

  const marcarConsumo = () => {
    if (consumoHoje < metaDiaria) {
      setConsumoHoje(prev => prev + 1);
      toast.success("Consumo registrado! 🍵");
    } else {
      toast.success("Meta diária já alcançada! 🎉");
    }
  };

  const ingredientes = [
    { nome: "Hibisco", quantidade: "1 colher de sopa", beneficio: "Acelera metabolismo" },
    { nome: "Canela em pau", quantidade: "1 pau pequeno", beneficio: "Controla açúcar no sangue" },
    { nome: "Gengibre fresco", quantidade: "3 fatias finas", beneficio: "Efeito termogênico" },
    { nome: "Limão", quantidade: "Suco de 1/2 limão", beneficio: "Rica em vitamina C" },
    { nome: "Água", quantidade: "500ml", beneficio: "Hidratação essencial" }
  ];

  const passosPreparo = [
    {
      passo: 1,
      titulo: "Preparar os ingredientes",
      descricao: "Descasque e corte o gengibre em fatias finas. Separe o hibisco e a canela em pau.",
      tempo: "2 min",
      dica: "Use gengibre fresco para potencializar o efeito termogênico"
    },
    {
      passo: 2,
      titulo: "Ferver a água",
      descricao: "Coloque 500ml de água em uma panela e leve ao fogo alto até atingir fervura completa.",
      tempo: "5 min",
      dica: "A água deve estar em fervura vigorosa para extrair melhor os nutrientes"
    },
    {
      passo: 3,
      titulo: "Adicionar hibisco e canela",
      descricao: "Desligue o fogo e adicione o hibisco e a canela em pau. Tampe a panela e deixe em infusão.",
      tempo: "10 min",
      dica: "Não ferva o hibisco diretamente para preservar suas propriedades"
    },
    {
      passo: 4,
      titulo: "Incluir o gengibre",
      descricao: "Após 5 minutos de infusão, adicione as fatias de gengibre e tampe novamente.",
      tempo: "5 min",
      dica: "O gengibre adicionado depois mantém seu sabor mais suave"
    },
    {
      passo: 5,
      titulo: "Coar e finalizar",
      descricao: "Coe o chá em uma jarra ou xícara, adicione o suco de limão fresco e misture bem.",
      tempo: "2 min",
      dica: "Adicione o limão apenas no final para preservar a vitamina C"
    },
    {
      passo: 6,
      titulo: "Servir adequadamente",
      descricao: "Consuma morno ou gelado. Se preferir gelado, espere esfriar antes de refrigerar.",
      tempo: "0 min",
      dica: "Evite adoçar para potencializar os efeitos do emagrecimento"
    }
  ];

  const beneficios = [
    { icone: Zap, titulo: "Acelera o Metabolismo", descricao: "Aumenta a queima de calorias em até 15%" },
    { icone: Heart, titulo: "Melhora Circulação", descricao: "Hibisco favorece a circulação sanguínea" },
    { icone: Droplets, titulo: "Efeito Diurético", descricao: "Elimina toxinas e reduz inchaço" },
    { icone: Leaf, titulo: "Antioxidante Natural", descricao: "Combate radicais livres e envelhecimento" }
  ];

  return (
    <Layout title="Chá Jaro - Queimador Natural" breadcrumb={["Home", "Chá Jaro"]}>
      <div className="space-y-8">
        {/* Imagem e Introdução */}
        <Card className="bg-gradient-to-r from-green-500/20 to-transparent border-green-500/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">
                  🍵 Chá Jaro
                </h1>
                <p className="text-white/80 text-lg mb-4">
                  O poderoso aliado natural do seu emagrecimento! Uma combinação especial de ingredientes 
                  termogênicos que aceleram o metabolismo e potencializam a queima de gordura.
                </p>
                <div className="flex gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    🔥 Termogênico
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    💧 Diurético
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    🌿 100% Natural
                  </Badge>
                </div>
              </div>
              <div className="h-64 lg:h-auto bg-gradient-to-br from-green-400/20 via-red-400/20 to-orange-400/20 flex items-center justify-center">
                <div className="text-8xl">🍵</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progresso Diário */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Consumo Diário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Progresso hoje</span>
              <span className="text-green-500 font-bold">{consumoHoje}/{metaDiaria} xícaras</span>
            </div>
            <Progress value={progressoConsumo} className="h-3" />
            <div className="flex justify-between">
              <p className="text-white/60 text-sm">
                {consumoHoje < metaDiaria 
                  ? `Faltam ${metaDiaria - consumoHoje} xícara(s) para completar sua meta!`
                  : "🎉 Meta diária alcançada! Parabéns!"
                }
              </p>
              <Button
                onClick={marcarConsumo}
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
                disabled={consumoHoje >= metaDiaria}
              >
                {consumoHoje >= metaDiaria ? "✓ Concluído" : "Marcar Consumo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ingredientes */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Ingredientes e Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ingredientes.map((ingrediente, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{ingrediente.nome}</h4>
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      {ingrediente.quantidade}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-sm">{ingrediente.beneficio}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modo de Preparo Detalhado */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Modo de Preparo Completo
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-white/70">
                <Clock className="w-4 h-4" />
                Tempo total: ~25 min
              </div>
              <div className="flex items-center gap-1 text-white/70">
                <Thermometer className="w-4 h-4" />
                Dificuldade: Fácil
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {passosPreparo.map((passo, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {passo.passo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{passo.titulo}</h4>
                      <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                        {passo.tempo}
                      </Badge>
                    </div>
                    <p className="text-white/80 mb-2">{passo.descricao}</p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-400 text-sm"><strong>Dica:</strong> {passo.dica}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-500" />
              Principais Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <beneficio.icone className="w-6 h-6 text-green-500" />
                    <h4 className="text-white font-medium">{beneficio.titulo}</h4>
                  </div>
                  <p className="text-white/70 text-sm">{beneficio.descricao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card className="bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              💡 Recomendações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Horários ideais:</strong> Pela manhã em jejum, antes do almoço e antes do jantar</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Consumo máximo:</strong> 3 xícaras por dia para evitar excessos</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Contraindicações:</strong> Evitar em caso de pressão alta, problemas renais ou gravidez</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Armazenamento:</strong> Pode ser guardado na geladeira por até 2 dias</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChaJaro;

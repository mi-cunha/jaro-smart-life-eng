
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProgressChart } from "@/components/ProgressChart";
import { Scale, TrendingDown, Target, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ProgressoPeso = () => {
  const navigate = useNavigate();
  
  const [pesoData, setPesoData] = useState({
    inicial: 80.0,
    atual: 75.2,
    objetivo: 70.0
  });
  
  const [novoPeso, setNovoPeso] = useState("");
  const [novoObjetivo, setNovoObjetivo] = useState("");

  const [historicoPeso] = useState([
    { date: '01/01', value: 80.0 },
    { date: '08/01', value: 79.5 },
    { date: '15/01', value: 78.8 },
    { date: '22/01', value: 77.9 },
    { date: '29/01', value: 77.2 },
    { date: '05/02', value: 76.8 },
    { date: '12/02', value: 76.1 },
    { date: '19/02', value: 75.7 },
    { date: '26/02', value: 75.2 },
  ]);

  const [tabelaHistorico] = useState([
    { data: '26/02/2024', peso: 75.2, variacao: -0.5 },
    { data: '19/02/2024', peso: 75.7, variacao: -0.4 },
    { data: '12/02/2024', peso: 76.1, variacao: -0.7 },
    { data: '05/02/2024', peso: 76.8, variacao: -0.4 },
    { data: '29/01/2024', peso: 77.2, variacao: -0.7 },
    { data: '22/01/2024', peso: 77.9, variacao: -0.9 },
    { data: '15/01/2024', peso: 78.8, variacao: -0.7 },
    { data: '08/01/2024', peso: 79.5, variacao: -0.5 },
    { data: '01/01/2024', peso: 80.0, variacao: 0 },
  ]);

  const progressoPercentual = ((pesoData.inicial - pesoData.atual) / (pesoData.inicial - pesoData.objetivo)) * 100;
  const pesoRestante = pesoData.atual - pesoData.objetivo;

  const handleAtualizarPeso = () => {
    const peso = parseFloat(novoPeso);
    if (peso && peso > 0 && peso < 200) {
      setPesoData(prev => ({ ...prev, atual: peso }));
      toast.success("Peso atualizado com sucesso! ✅");
      setNovoPeso("");
      
      // Verificar se atingiu a meta
      if (peso <= pesoData.objetivo) {
        toast.success("🏆 Parabéns! Meta de peso atingida!");
      }
    } else {
      toast.error("Por favor, insira um peso válido.");
    }
  };

  const handleAtualizarObjetivo = () => {
    const objetivo = parseFloat(novoObjetivo);
    if (objetivo && objetivo > 0 && objetivo < pesoData.atual) {
      setPesoData(prev => ({ ...prev, objetivo }));
      toast.success("Objetivo atualizado com sucesso! ✅");
      setNovoObjetivo("");
    } else {
      toast.error("O objetivo deve ser menor que o peso atual.");
    }
  };

  const exportarCSV = () => {
    const csvContent = [
      ["Data", "Peso (kg)", "Variação (kg)"],
      ...tabelaHistorico.map(item => [item.data, item.peso, item.variacao])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_peso_jarosmart.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Histórico exportado com sucesso! 📊");
  };

  return (
    <Layout title="Progresso de Peso" breadcrumb={["Home", "Progresso de Peso"]}>
      <div className="space-y-8">
        {/* Cards de Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-neon-green" />
                Peso Inicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pesoData.inicial} kg</div>
              <div className="text-sm text-white/60 mt-1">Janeiro 2024</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-neon-green" />
                Peso Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-neon-green">{pesoData.atual} kg</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Atualizar Peso
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Atualizar Peso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Novo peso (kg):</label>
                      <Input
                        type="number"
                        value={novoPeso}
                        onChange={(e) => setNovoPeso(e.target.value)}
                        placeholder="Ex: 74.5"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleAtualizarPeso}
                      className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      Salvar Peso
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-green" />
                Peso Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-white">{pesoData.objetivo} kg</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Editar Objetivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Editar Objetivo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Novo objetivo (kg):</label>
                      <Input
                        type="number"
                        value={novoObjetivo}
                        onChange={(e) => setNovoObjetivo(e.target.value)}
                        placeholder="Ex: 68.0"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleAtualizarObjetivo}
                      className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      Salvar Objetivo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Progresso */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Progresso até o Objetivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>Peso Inicial: {pesoData.inicial} kg</span>
              <span>Você está em {progressoPercentual.toFixed(1)}% do caminho</span>
              <span>Objetivo: {pesoData.objetivo} kg</span>
            </div>
            
            <div className="relative">
              <div className="progress-bar h-4">
                <div 
                  className="progress-fill h-full relative"
                  style={{ width: `${Math.min(100, Math.max(0, progressoPercentual))}%` }}
                >
                  <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-8 text-neon-green text-sm font-bold">
                    {pesoData.atual} kg
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-neon-green">
                {pesoRestante > 0 ? `${pesoRestante.toFixed(1)} kg restantes` : "Meta atingida! 🎉"}
              </div>
              <div className="text-white/60">
                Você já perdeu {(pesoData.inicial - pesoData.atual).toFixed(1)} kg
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Evolução */}
        <ProgressChart
          title="Evolução do Peso"
          data={historicoPeso}
          type="line"
          unit=" kg"
        />

        {/* Histórico de Pesagens */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neon-green" />
              Histórico de Pesagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 py-3">Data</th>
                    <th className="text-left text-white/80 py-3">Peso Registrado</th>
                    <th className="text-left text-white/80 py-3">Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelaHistorico.map((registro, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="text-white py-3">{registro.data}</td>
                      <td className="text-white py-3">{registro.peso} kg</td>
                      <td className={`py-3 ${
                        registro.variacao < 0 ? 'text-neon-green' : 
                        registro.variacao > 0 ? 'text-red-400' : 'text-white/60'
                      }`}>
                        {registro.variacao === 0 ? '--' : 
                         `${registro.variacao > 0 ? '+' : ''}${registro.variacao} kg`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button 
                onClick={exportarCSV}
                variant="outline"
                className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-green">
                {((pesoData.inicial - pesoData.atual) / 8 * 7).toFixed(1)} kg
              </div>
              <div className="text-sm text-white/70">Perda média por semana</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-green">
                {Math.ceil(pesoRestante / 0.6)}
              </div>
              <div className="text-sm text-white/70">Semanas estimadas para meta</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-green">
                {((pesoData.inicial - pesoData.atual) / pesoData.inicial * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-white/70">Redução percentual</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-neon-green">
                {tabelaHistorico.length}
              </div>
              <div className="text-sm text-white/70">Total de pesagens</div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Ver Progresso Geral
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            Voltar ao Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

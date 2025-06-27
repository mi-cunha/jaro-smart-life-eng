
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProgressChart } from "@/components/ProgressChart";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { Scale, TrendingDown, Target, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { usePeso } from "@/hooks/usePeso";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";

const ProgressoPeso = () => {
  const navigate = useNavigate();
  const { unit, formatWeight, convertToDisplayWeight, convertToStorageWeight } = useWeightUnit();
  const { pesoAtual, adicionarPeso, getDadosGrafico, historicoPeso } = usePeso();
  const { perfil } = useSupabasePerfil();
  
  const [novoPeso, setNovoPeso] = useState("");
  const [novoObjetivo, setNovoObjetivo] = useState("");

  // Use data from user profile and weight history
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : null;
  const goalWeight = perfil?.peso_objetivo ? convertToDisplayWeight(perfil.peso_objetivo) : null;
  
  // Starting weight should come from the first weight entry (oldest) or peso_atual from perfil
  const startingWeight = historicoPeso.length > 0 ? 
    convertToDisplayWeight(historicoPeso[historicoPeso.length - 1].peso) : 
    (perfil?.peso_atual ? convertToDisplayWeight(perfil.peso_atual) : null);

  // Calculate progress correctly using starting weight, current weight, and goal
  const calculateProgressPercentual = () => {
    if (!currentWeight || !goalWeight || !startingWeight || startingWeight <= goalWeight) {
      return 0;
    }
    
    const totalWeightToLose = startingWeight - goalWeight;
    const weightLostSoFar = startingWeight - currentWeight;
    
    return Math.max(0, Math.min(100, (weightLostSoFar / totalWeightToLose) * 100));
  };

  const progressoPercentual = calculateProgressPercentual();
  const pesoRestante = currentWeight && goalWeight ? Math.max(0, currentWeight - goalWeight) : 0;
  const pesoJaPerdido = startingWeight && currentWeight ? Math.max(0, startingWeight - currentWeight) : 0;

  const handleAtualizarPeso = async () => {
    const peso = parseFloat(novoPeso);
    if (peso && peso > 0) {
      const pesoParaSalvar = convertToStorageWeight(peso);
      await adicionarPeso(pesoParaSalvar);
      setNovoPeso("");
      
      if (goalWeight && peso <= goalWeight) {
        toast.success("🏆 Parabéns! Meta de peso alcançada!");
      }
    } else {
      toast.error("Por favor, insira um peso válido.");
    }
  };

  const handleAtualizarObjetivo = () => {
    const objetivo = parseFloat(novoObjetivo);
    if (objetivo && objetivo > 0 && currentWeight && objetivo < currentWeight) {
      toast.success("Meta atualizada com sucesso! ✅");
      setNovoObjetivo("");
    } else {
      toast.error("A meta deve ser menor que o peso atual.");
    }
  };

  const exportarCSV = () => {
    if (historicoPeso.length === 0) {
      toast.error("Não há dados de peso para exportar");
      return;
    }

    const csvContent = [
      ["Data", `Peso (${unit})`, `Mudança (${unit})`],
      ...getDadosGrafico().map(item => [item.date, convertToDisplayWeight(item.value), ""])
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

  // Show empty state if no weight data
  if (!currentWeight && !startingWeight && historicoPeso.length === 0) {
    return (
      <Layout title="Progresso do Peso" breadcrumb={["Home", "Progresso do Peso"]}>
        <div className="space-y-6 md:space-y-8 px-2 md:px-0">
          <div className="flex justify-end">
            <WeightUnitToggle />
          </div>

          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 md:p-12 text-center">
              <Scale className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Sem Dados de Peso</h3>
              <p className="text-white/60 mb-6 text-sm md:text-base">Comece a acompanhar seu progresso de peso adicionando sua primeira entrada de peso.</p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-neon-green text-black hover:bg-neon-green/90 w-full sm:w-auto">
                    Adicionar Primeira Entrada de Peso
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Entrada de Peso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Peso atual ({unit}):</label>
                      <Input
                        type="number"
                        value={novoPeso}
                        onChange={(e) => setNovoPeso(e.target.value)}
                        placeholder={`Ex: ${unit === 'lb' ? '165' : '75'}`}
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Progresso do Peso" breadcrumb={["Home", "Progresso do Peso"]}>
      <div className="space-y-6 md:space-y-8 px-2 md:px-0">
        {/* Weight Unit Toggle */}
        <div className="flex justify-end">
          <WeightUnitToggle />
        </div>

        {/* Main Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm md:text-base">
                <Scale className="w-4 h-4 md:w-5 md:h-5 text-neon-green flex-shrink-0" />
                Peso Inicial
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {startingWeight ? formatWeight(startingWeight) : 'Sem dados'}
              </div>
              <div className="text-xs md:text-sm text-white/60 mt-1">
                {historicoPeso.length > 0 ? new Date(historicoPeso[historicoPeso.length - 1].data).toLocaleDateString() : 'Adicionar primeira entrada'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm md:text-base">
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-neon-green flex-shrink-0" />
                Peso Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-neon-green">
                {currentWeight ? formatWeight(currentWeight) : 'Sem dados'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm"
                  >
                    Atualizar Peso
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Atualizar Peso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Novo peso ({unit}):</label>
                      <Input
                        type="number"
                        value={novoPeso}
                        onChange={(e) => setNovoPeso(e.target.value)}
                        placeholder={`Ex: ${unit === 'lb' ? '165' : '75'}`}
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
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm md:text-base">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-neon-green flex-shrink-0" />
                Meta de Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {goalWeight ? formatWeight(goalWeight) : 'Definir meta'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm"
                  >
                    {goalWeight ? 'Editar Meta' : 'Definir Meta'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">{goalWeight ? 'Editar Meta' : 'Definir Meta'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Meta de peso ({unit}):</label>
                      <Input
                        type="number"
                        value={novoObjetivo}
                        onChange={(e) => setNovoObjetivo(e.target.value)}
                        placeholder={`Ex: ${unit === 'lb' ? '150' : '68'}`}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleAtualizarObjetivo}
                      className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      Salvar Meta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar - only show if we have the required data */}
        {currentWeight && goalWeight && startingWeight && (
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm md:text-base">Progresso para a Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs md:text-sm text-white/70 gap-2">
                <span className="truncate">Inicial: {formatWeight(startingWeight)}</span>
                <span className="text-center flex-shrink-0">Você está {progressoPercentual.toFixed(1)}% do caminho</span>
                <span className="truncate text-right">Meta: {formatWeight(goalWeight)}</span>
              </div>
              
              <div className="relative">
                <div className="progress-bar h-3 md:h-4">
                  <div 
                    className="progress-fill h-full relative"
                    style={{ width: `${Math.min(100, Math.max(0, progressoPercentual))}%` }}
                  >
                    <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-6 md:-translate-y-8 text-neon-green text-xs md:text-sm font-bold">
                      {formatWeight(currentWeight)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-xl md:text-2xl font-bold text-neon-green">
                  {pesoRestante > 0 ? `${formatWeight(pesoRestante, false)} ${unit} restante` : "Meta alcançada! 🎉"}
                </div>
                <div className="text-white/60 text-sm md:text-base">
                  Você já perdeu {formatWeight(pesoJaPerdido, false)} {unit}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weight Evolution Chart - only show if we have data */}
        {historicoPeso.length > 0 && (
          <div className="px-1">
            <ProgressChart
              title="Evolução do Peso"
              data={getDadosGrafico().map(item => ({
                ...item,
                value: convertToDisplayWeight(item.value)
              }))}
              type="line"
              unit={` ${unit}`}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-1">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto text-sm"
          >
            Ver Progresso Geral
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90 w-full sm:w-auto text-sm"
          >
            Voltar ao Início
          </Button>

          {historicoPeso.length > 0 && (
            <Button
              onClick={exportarCSV}
              variant="outline"
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto text-sm"
            >
              Exportar Dados
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

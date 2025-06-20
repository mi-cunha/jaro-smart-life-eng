
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

  // Use data from user profile - peso_atual as starting weight and peso_objetivo as goal
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : null;
  const goalWeight = perfil?.peso_objetivo ? convertToDisplayWeight(perfil.peso_objetivo) : null;
  
  // Starting weight should come from peso_atual in perfil_usuario table, not from weight history
  const startingWeight = perfil?.peso_atual ? convertToDisplayWeight(perfil.peso_atual) : 
                        (historicoPeso.length > 0 ? convertToDisplayWeight(historicoPeso[historicoPeso.length - 1].peso) : null);

  // Only calculate progress if we have all required data
  const progressoPercentual = currentWeight && goalWeight && startingWeight && startingWeight > goalWeight
    ? ((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100
    : 0;
  
  const pesoRestante = currentWeight && goalWeight ? currentWeight - goalWeight : 0;

  const handleAtualizarPeso = async () => {
    const peso = parseFloat(novoPeso);
    if (peso && peso > 0) {
      const pesoParaSalvar = convertToStorageWeight(peso);
      await adicionarPeso(pesoParaSalvar);
      setNovoPeso("");
      
      if (goalWeight && peso <= goalWeight) {
        toast.success("🏆 Congratulations! Weight goal achieved!");
      }
    } else {
      toast.error("Please enter a valid weight.");
    }
  };

  const handleAtualizarObjetivo = () => {
    const objetivo = parseFloat(novoObjetivo);
    if (objetivo && objetivo > 0 && currentWeight && objetivo < currentWeight) {
      toast.success("Goal updated successfully! ✅");
      setNovoObjetivo("");
    } else {
      toast.error("Goal must be less than current weight.");
    }
  };

  const exportarCSV = () => {
    if (historicoPeso.length === 0) {
      toast.error("No weight data to export");
      return;
    }

    const csvContent = [
      ["Date", `Weight (${unit})`, `Change (${unit})`],
      ...getDadosGrafico().map(item => [item.date, convertToDisplayWeight(item.value), ""])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weight_history_jarosmart.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("History exported successfully! 📊");
  };

  // Show empty state if no weight data
  if (!currentWeight && !startingWeight && historicoPeso.length === 0) {
    return (
      <Layout title="Weight Progress" breadcrumb={["Home", "Weight Progress"]}>
        <div className="space-y-6 md:space-y-8 px-2 md:px-0">
          <div className="flex justify-end">
            <WeightUnitToggle />
          </div>

          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 md:p-12 text-center">
              <Scale className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No Weight Data</h3>
              <p className="text-white/60 mb-6 text-sm md:text-base">Start tracking your weight progress by adding your first weight entry.</p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-neon-green text-black hover:bg-neon-green/90 w-full sm:w-auto">
                    Add First Weight Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Weight Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Current weight ({unit}):</label>
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
                      Save Weight
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
    <Layout title="Weight Progress" breadcrumb={["Home", "Weight Progress"]}>
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
                Starting Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {startingWeight ? formatWeight(startingWeight) : 'No data'}
              </div>
              <div className="text-xs md:text-sm text-white/60 mt-1">
                {perfil?.peso_atual ? 'From your profile' : 
                 (historicoPeso.length > 0 ? new Date(historicoPeso[historicoPeso.length - 1].data).toLocaleDateString() : 'Add first entry')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm md:text-base">
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-neon-green flex-shrink-0" />
                Current Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-neon-green">
                {currentWeight ? formatWeight(currentWeight) : 'No data'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm"
                  >
                    Update Weight
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Update Weight</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">New weight ({unit}):</label>
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
                      Save Weight
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
                Goal Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {goalWeight ? formatWeight(goalWeight) : 'Set goal'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm"
                  >
                    {goalWeight ? 'Edit Goal' : 'Set Goal'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10 mx-4 md:mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">{goalWeight ? 'Edit Goal' : 'Set Goal'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">Goal weight ({unit}):</label>
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
                      Save Goal
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
              <CardTitle className="text-white text-sm md:text-base">Progress to Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs md:text-sm text-white/70 gap-2">
                <span className="truncate">Starting: {formatWeight(startingWeight)}</span>
                <span className="text-center flex-shrink-0">You are {progressoPercentual.toFixed(1)}% of the way there</span>
                <span className="truncate text-right">Goal: {formatWeight(goalWeight)}</span>
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
                  {pesoRestante > 0 ? `${formatWeight(pesoRestante, false)} ${unit} remaining` : "Goal achieved! 🎉"}
                </div>
                <div className="text-white/60 text-sm md:text-base">
                  You've already lost {formatWeight(startingWeight - currentWeight, false)} {unit}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weight Evolution Chart - only show if we have data */}
        {historicoPeso.length > 0 && (
          <div className="px-1">
            <ProgressChart
              title="Weight Evolution"
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
            View Overall Progress
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90 w-full sm:w-auto text-sm"
          >
            Back to Home
          </Button>

          {historicoPeso.length > 0 && (
            <Button
              onClick={exportarCSV}
              variant="outline"
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto text-sm"
            >
              Export Data
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

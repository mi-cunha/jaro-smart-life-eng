
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

  // Use real data from database or show empty state
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : null;
  const goalWeight = perfil?.peso_objetivo ? convertToDisplayWeight(perfil.peso_objetivo) : null;
  const initialWeight = historicoPeso.length > 0 ? convertToDisplayWeight(historicoPeso[historicoPeso.length - 1].peso) : null;

  // Only calculate progress if we have all required data
  const progressoPercentual = currentWeight && goalWeight && initialWeight && initialWeight > goalWeight
    ? ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100
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
  if (!currentWeight && historicoPeso.length === 0) {
    return (
      <Layout title="Weight Progress" breadcrumb={["Home", "Weight Progress"]}>
        <div className="space-y-8">
          <div className="flex justify-end">
            <WeightUnitToggle />
          </div>

          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-12 text-center">
              <Scale className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Weight Data</h3>
              <p className="text-white/60 mb-6">Start tracking your weight progress by adding your first weight entry.</p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-neon-green text-black hover:bg-neon-green/90">
                    Add First Weight Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
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
      <div className="space-y-8">
        {/* Weight Unit Toggle */}
        <div className="flex justify-end">
          <WeightUnitToggle />
        </div>

        {/* Main Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-neon-green" />
                Starting Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {initialWeight ? formatWeight(initialWeight) : 'No data'}
              </div>
              <div className="text-sm text-white/60 mt-1">
                {historicoPeso.length > 0 ? new Date(historicoPeso[historicoPeso.length - 1].data).toLocaleDateString() : 'Add first entry'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-neon-green" />
                Current Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-neon-green">
                {currentWeight ? formatWeight(currentWeight) : 'No data'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Update Weight
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
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
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-green" />
                Goal Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-white">
                {goalWeight ? formatWeight(goalWeight) : 'Set goal'}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    {goalWeight ? 'Edit Goal' : 'Set Goal'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
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
        {currentWeight && goalWeight && initialWeight && (
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Progress to Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-white/70">
                <span>Starting: {formatWeight(initialWeight)}</span>
                <span>You are {progressoPercentual.toFixed(1)}% of the way there</span>
                <span>Goal: {formatWeight(goalWeight)}</span>
              </div>
              
              <div className="relative">
                <div className="progress-bar h-4">
                  <div 
                    className="progress-fill h-full relative"
                    style={{ width: `${Math.min(100, Math.max(0, progressoPercentual))}%` }}
                  >
                    <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-8 text-neon-green text-sm font-bold">
                      {formatWeight(currentWeight)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-neon-green">
                  {pesoRestante > 0 ? `${formatWeight(pesoRestante, false)} ${unit} remaining` : "Goal achieved! 🎉"}
                </div>
                <div className="text-white/60">
                  You've already lost {formatWeight(initialWeight - currentWeight, false)} {unit}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weight Evolution Chart - only show if we have data */}
        {historicoPeso.length > 0 && (
          <ProgressChart
            title="Weight Evolution"
            data={getDadosGrafico().map(item => ({
              ...item,
              value: convertToDisplayWeight(item.value)
            }))}
            type="line"
            unit={` ${unit}`}
          />
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            View Overall Progress
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            Back to Home
          </Button>

          {historicoPeso.length > 0 && (
            <Button
              onClick={exportarCSV}
              variant="outline"
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
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

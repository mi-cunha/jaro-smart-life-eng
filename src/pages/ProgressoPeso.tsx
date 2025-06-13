
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

const ProgressoPeso = () => {
  const navigate = useNavigate();
  const { unit, formatWeight, convertToDisplayWeight, convertToStorageWeight } = useWeightUnit();
  const { pesoAtual, pesoMeta, adicionarPeso, getDadosGrafico } = usePeso();
  
  const [novoPeso, setNovoPeso] = useState("");
  const [novoObjetivo, setNovoObjetivo] = useState("");

  // Convert weights for display
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : 175;
  const goalWeight = pesoMeta ? convertToDisplayWeight(pesoMeta) : 154;
  const initialWeight = 176; // Sample initial weight

  const progressoPercentual = ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100;
  const pesoRestante = currentWeight - goalWeight;

  const handleAtualizarPeso = async () => {
    const peso = parseFloat(novoPeso);
    if (peso && peso > 0) {
      const pesoParaSalvar = convertToStorageWeight(peso);
      await adicionarPeso(pesoParaSalvar);
      setNovoPeso("");
      
      if (peso <= goalWeight) {
        toast.success("🏆 Congratulations! Weight goal achieved!");
      }
    } else {
      toast.error("Please enter a valid weight.");
    }
  };

  const handleAtualizarObjetivo = () => {
    const objetivo = parseFloat(novoObjetivo);
    if (objetivo && objetivo > 0 && objetivo < currentWeight) {
      toast.success("Goal updated successfully! ✅");
      setNovoObjetivo("");
    } else {
      toast.error("Goal must be less than current weight.");
    }
  };

  const exportarCSV = () => {
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
              <div className="text-3xl font-bold text-white">{formatWeight(initialWeight)}</div>
              <div className="text-sm text-white/60 mt-1">January 2024</div>
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
              <div className="text-3xl font-bold text-neon-green">{formatWeight(currentWeight)}</div>
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
              <div className="text-3xl font-bold text-white">{formatWeight(goalWeight)}</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Edit Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dark-bg border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Edit Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm">New goal ({unit}):</label>
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

        {/* Progress Bar */}
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

        {/* Weight Evolution Chart */}
        <ProgressChart
          title="Weight Evolution"
          data={getDadosGrafico().map(item => ({
            ...item,
            value: convertToDisplayWeight(item.value)
          }))}
          type="line"
          unit={` ${unit}`}
        />

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
        </div>
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

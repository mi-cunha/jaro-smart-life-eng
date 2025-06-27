
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ProgressChart } from "@/components/ProgressChart";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { Scale, Target, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { usePeso } from "@/hooks/usePeso";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useAuth } from "@/hooks/useAuth";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";
import { toast } from "sonner";

const ProgressoPeso = () => {
  const { 
    pesoAtual, 
    pesoMeta, 
    historicoPeso, 
    adicionarPeso, 
    definirMeta, 
    getProgressoPeso, 
    getDadosGrafico 
  } = usePeso();
  
  const { convertToDisplayWeight, convertFromDisplayWeight, formatWeight, unit } = useWeightUnit();
  const { user } = useAuth();
  const { perfil } = useSupabasePerfil();
  
  const [novoPeso, setNovoPeso] = useState("");
  const [novaMeta, setNovaMeta] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleAdicionarPeso = async () => {
    if (!novoPeso || isNaN(Number(novoPeso))) {
      toast.error("Please enter a valid weight");
      return;
    }

    const pesoConvertido = convertFromDisplayWeight(Number(novoPeso));
    const sucesso = await adicionarPeso(pesoConvertido, observacoes);
    
    if (sucesso) {
      setNovoPeso("");
      setObservacoes("");
      toast.success("Weight added successfully!");
    } else {
      toast.error("Error adding weight");
    }
  };

  const handleDefinirMeta = async () => {
    if (!novaMeta || isNaN(Number(novaMeta))) {
      toast.error("Please enter a valid goal weight");
      return;
    }

    const metaConvertida = convertFromDisplayWeight(Number(novaMeta));
    const sucesso = await definirMeta(metaConvertida);
    
    if (sucesso) {
      setNovaMeta("");
      toast.success("Goal weight set successfully!");
    } else {
      toast.error("Error setting goal weight");
    }
  };

  const progressoPeso = getProgressoPeso();
  const dadosGrafico = getDadosGrafico();
  
  // Get initial weight from profile or first weight entry
  const initialWeight = perfil?.peso_atual ? convertToDisplayWeight(perfil.peso_atual) : 
    (historicoPeso.length > 0 ? convertToDisplayWeight(historicoPeso[0].peso) : 0);
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : 0;
  const goalWeight = pesoMeta ? convertToDisplayWeight(pesoMeta) : 0;
  
  // Calculate weight lost and remaining
  const weightLost = Math.max(0, initialWeight - currentWeight);
  const weightRemaining = Math.max(0, currentWeight - goalWeight);

  return (
    <Layout title="Weight Progress" breadcrumb={["Home", "Weight Progress"]}>
      <div className="space-y-8">
        
        {/* Weight Unit Toggle */}
        <div className="flex justify-end">
          <WeightUnitToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <Scale className="w-8 h-8 text-neon-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-neon-green">
                {formatWeight(initialWeight, false)} {unit}
              </div>
              <div className="text-sm text-white/70">Initial Weight</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">
                {goalWeight ? `${formatWeight(goalWeight, false)} ${unit}` : "Not set"}
              </div>
              <div className="text-sm text-white/70">Goal Weight</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">
                {formatWeight(weightLost, false)} {unit}
              </div>
              <div className="text-sm text-white/70">Weight Lost</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-orange-400">
                {formatWeight(weightRemaining, false)} {unit}
              </div>
              <div className="text-sm text-white/70">Remaining</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-green" />
                Progress to Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressoPeso} className="h-4" />
              <div className="text-center">
                <span className="text-neon-green font-semibold text-2xl">
                  {progressoPeso.toFixed(1)}%
                </span>
                <p className="text-white/60 text-sm mt-1">
                  {weightRemaining > 0 ? `${formatWeight(weightRemaining, false)} ${unit} to go` : 'Goal achieved!'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Add New Weight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="peso" className="text-white">Weight ({unit})</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={novoPeso}
                  onChange={(e) => setNovoPeso(e.target.value)}
                  placeholder={`Enter weight in ${unit}`}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="observacoes" className="text-white">Notes (optional)</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Add any notes about your progress..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <Button 
                onClick={handleAdicionarPeso}
                className="w-full bg-neon-green hover:bg-neon-green/80 text-black"
              >
                Add Weight
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Set Goal Weight */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Set Goal Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="meta" className="text-white">Goal Weight ({unit})</Label>
                <Input
                  id="meta"
                  type="number"
                  step="0.1"
                  value={novaMeta}
                  onChange={(e) => setNovaMeta(e.target.value)}
                  placeholder={`Enter goal weight in ${unit}`}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleDefinirMeta}
                  className="bg-purple-500 hover:bg-purple-500/80 text-white"
                >
                  Set Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        {dadosGrafico.length > 0 && (
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Weight Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={dadosGrafico} />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

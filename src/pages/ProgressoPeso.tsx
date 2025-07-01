
import { Layout } from "@/components/Layout";
import { ProgressCard } from "@/components/ProgressCard";
import { ProgressChart } from "@/components/ProgressChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { usePesoContext } from "@/contexts/PesoContext";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useState } from "react";
import { Scale, Target, Plus } from "lucide-react";

const ProgressoPeso = () => {
  const { 
    pesoAtual, 
    pesoMeta, 
    getProgressoPeso, 
    getDadosGrafico, 
    adicionarPeso, 
    definirMeta, 
    loading 
  } = usePesoContext();
  
  const { formatWeight, convertToDisplayWeight, convertFromDisplayWeight } = useWeightUnit();
  const [novoPeso, setNovoPeso] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [novaMeta, setNovaMeta] = useState("");
  const [adicionandoPeso, setAdicionandoPeso] = useState(false);
  const [definindoMeta, setDefinindoMeta] = useState(false);

  const handleAdicionarPeso = async () => {
    if (!novoPeso) return;
    
    setAdicionandoPeso(true);
    try {
      const pesoEmKg = convertFromDisplayWeight(parseFloat(novoPeso));
      const sucesso = await adicionarPeso(pesoEmKg, observacoes);
      
      if (sucesso) {
        setNovoPeso("");
        setObservacoes("");
      }
    } finally {
      setAdicionandoPeso(false);
    }
  };

  const handleDefinirMeta = async () => {
    if (!novaMeta) return;
    
    setDefinindoMeta(true);
    try {
      const metaEmKg = convertFromDisplayWeight(parseFloat(novaMeta));
      const sucesso = await definirMeta(metaEmKg);
      
      if (sucesso) {
        setNovaMeta("");
      }
    } finally {
      setDefinindoMeta(false);
    }
  };

  const progressoPeso = getProgressoPeso();
  const dadosGrafico = getDadosGrafico();
  
  // Convert weights for display
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : 0;
  const goalWeight = pesoMeta ? convertToDisplayWeight(pesoMeta) : 0;
  const weightDifference = Math.abs(currentWeight - goalWeight);

  if (loading) {
    return (
      <Layout title="Weight Progress" breadcrumb={["Weight Progress"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading weight data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Weight Progress" breadcrumb={["Weight Progress"]}>
      <div className="space-y-8">
        {/* Header with Weight Unit Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Weight Progress</h1>
            <p className="text-white/60">Track your weight journey and achieve your goals</p>
          </div>
          <WeightUnitToggle />
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Current Weight"
            value={formatWeight(currentWeight)}
            icon={<Scale className="w-6 h-6" />}
            color="bg-neon-green"
          />
          <ProgressCard
            title="Goal Weight"
            value={formatWeight(goalWeight)}
            icon={<Target className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <ProgressCard
            title="Progress"
            value={`${progressoPeso.toFixed(1)}%`}
            icon={<Plus className="w-6 h-6" />}
            color="bg-purple-500"
          />
        </div>

        {/* Progress Chart */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Weight Progress Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={dadosGrafico} />
          </CardContent>
        </Card>

        {/* Add New Weight */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-neon-green" />
              Add New Weight Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso" className="text-white">Weight</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder={`Enter weight`}
                  value={novoPeso}
                  onChange={(e) => setNovoPeso(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-white">Notes (Optional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Add any notes about this weight entry..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <Button 
              onClick={handleAdicionarPeso} 
              disabled={!novoPeso || adicionandoPeso}
              className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
            >
              {adicionandoPeso ? "Adding..." : "Add Weight Entry"}
            </Button>
          </CardContent>
        </Card>

        {/* Set Goal Weight */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Set Goal Weight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta" className="text-white">Goal Weight</Label>
              <Input
                id="meta"
                type="number"
                step="0.1"
                placeholder={`Enter your goal weight`}
                value={novaMeta}
                onChange={(e) => setNovaMeta(e.target.value)}
                className="bg-white/10 border-white/20 text-white max-w-xs"
              />
            </div>
            <Button 
              onClick={handleDefinirMeta} 
              disabled={!novaMeta || definindoMeta}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {definindoMeta ? "Setting..." : "Set Goal"}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="text-sm text-white/60">Weight to Goal</p>
                <p className="text-lg font-semibold">{formatWeight(weightDifference, false)} remaining</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Progress</p>
                <p className="text-lg font-semibold">{progressoPeso.toFixed(1)}% completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

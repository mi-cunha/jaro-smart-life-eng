
import { Layout } from "@/components/Layout";
import { SimpleProgressCard } from "@/components/SimpleProgressCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { usePesoContext } from "@/contexts/PesoContext";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useState, useEffect } from "react";
import { Scale, Target, Plus, TrendingDown } from "lucide-react";
import { testPesoServices } from "@/utils/testPesoService";

const ProgressoPeso = () => {
  const { 
    pesoAtual, 
    pesoMeta, 
    pesoInicial,
    getProgressoPeso, 
    getWeightLoss,
    adicionarPeso, 
    definirMeta, 
    loading 
  } = usePesoContext();
  
  // Debug logs
  console.log('🏋️ ProgressoPeso - Estado atual:', {
    pesoAtual,
    pesoMeta,
    pesoInicial,
    loading,
    progressoPeso: getProgressoPeso(),
    weightLoss: getWeightLoss()
  });
  
  // Executar teste automático na primeira renderização
  useEffect(() => {
    console.log('🧪 ProgressoPeso - Executando teste automático...');
    testPesoServices();
  }, []);
  
  const { formatWeight, convertToDisplayWeight, convertFromDisplayWeight } = useWeightUnit();
  const [novoPeso, setNovoPeso] = useState("");
  const [novaMeta, setNovaMeta] = useState("");
  const [adicionandoPeso, setAdicionandoPeso] = useState(false);
  const [definindoMeta, setDefinindoMeta] = useState(false);

  const handleAdicionarPeso = async () => {
    if (!novoPeso) return;
    
    setAdicionandoPeso(true);
    try {
      const pesoEmKg = convertFromDisplayWeight(parseFloat(novoPeso));
      const sucesso = await adicionarPeso(pesoEmKg);
      
      if (sucesso) {
        setNovoPeso("");
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
  const weightLoss = getWeightLoss();
  
  // Convert weights for display
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : 0;
  const goalWeight = pesoMeta ? convertToDisplayWeight(pesoMeta) : 0;
  const weightLossDisplay = convertToDisplayWeight(weightLoss);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SimpleProgressCard
            title="Current Weight"
            value={formatWeight(currentWeight)}
            icon={<Scale className="w-6 h-6" />}
            color="bg-neon-green"
          />
          <SimpleProgressCard
            title="Goal Weight"
            value={formatWeight(goalWeight)}
            icon={<Target className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <SimpleProgressCard
            title="Weight Loss"
            value={formatWeight(weightLossDisplay)}
            icon={<TrendingDown className="w-6 h-6" />}
            color="bg-orange-500"
          />
          <SimpleProgressCard
            title="Progress"
            value={`${progressoPeso.toFixed(1)}%`}
            icon={<Plus className="w-6 h-6" />}
            color="bg-purple-500"
          />
        </div>

        {/* Add New Weight */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-neon-green" />
              Add New Weight Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peso" className="text-white">Weight</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder={`Enter weight`}
                value={novoPeso}
                onChange={(e) => setNovoPeso(e.target.value)}
                className="bg-white/10 border-white/20 text-white max-w-xs"
              />
            </div>
            <Button 
              onClick={handleAdicionarPeso} 
              disabled={!novoPeso || adicionandoPeso}
              className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
            >
              {adicionandoPeso ? "Adding..." : "Add Weight Entry"}
            </Button>
            {/* Botão de teste temporário */}
            <Button 
              onClick={() => {
                console.log('🧪 Teste manual - Recarregando dados...');
                // Vamos acessar diretamente a função de carregamento se existir
                if (window.location.reload) {
                  window.location.reload();
                }
              }}
              variant="outline"
              className="ml-2 border-white/20 text-white"
            >
              🧪 Teste Reload
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
      </div>
    </Layout>
  );
};

export default ProgressoPeso;

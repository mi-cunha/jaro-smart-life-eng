import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Thermometer, Droplets, Leaf, CheckCircle, Info, Zap, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useHabitos } from "@/hooks/useHabitos";
import { supabase } from "@/integrations/supabase/client";

const ChaJaro = () => {
  const { getHabitosHoje, loading } = useHabitos();
  const [chaJaroHabito, setChaJaroHabito] = useState<any>(null);
  const [consumoAtual, setConsumoAtual] = useState(0);

  useEffect(() => {
    const habitos = getHabitosHoje();
    const chaJaro = habitos.find(h => 
      h.nome === 'Chá Jaro' || 
      h.nome === 'Tomar todas as doses de chá' ||
      h.nome.toLowerCase().includes('chá')
    );
    setChaJaroHabito(chaJaro);
  }, []);

  const dailyGoal = chaJaroHabito?.meta_diaria || 2;
  const progressPercentage = (consumoAtual / dailyGoal) * 100;

  // Buscar consumo atual do histórico
  useEffect(() => {
    const buscarConsumoAtual = async () => {
      if (!chaJaroHabito) return;
      
      try {
        const hoje = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('historico_habitos')
          .select('quantidade')
          .eq('habito_id', chaJaroHabito.id)
          .eq('data', hoje)
          .maybeSingle();

        if (!error && data) {
          setConsumoAtual(data.quantidade || 0);
        } else {
          setConsumoAtual(0);
        }
      } catch (error) {
        console.error('Erro ao buscar consumo atual:', error);
        setConsumoAtual(0);
      }
    };

    buscarConsumoAtual();
  }, [chaJaroHabito]);

  const markConsumption = async () => {
    if (!chaJaroHabito) {
      toast.error("Tea habit not found");
      return;
    }

    if (consumoAtual >= dailyGoal) {
      toast.success("Daily goal already achieved! 🎉");
      return;
    }

    const novoConsumo = consumoAtual + 1;
    const habitoCompleto = novoConsumo >= dailyGoal;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Atualizar ou inserir histórico
      const { data: existing } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('habito_id', chaJaroHabito.id)
        .eq('data', hoje)
        .maybeSingle();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('historico_habitos')
          .update({ 
            quantidade: novoConsumo,
            concluido: habitoCompleto,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          toast.error('Error updating consumption');
          return;
        }
      } else {
        // Criar novo registro
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('historico_habitos')
          .insert({
            user_email: user?.email,
            habito_id: chaJaroHabito.id,
            data: hoje,
            quantidade: novoConsumo,
            concluido: habitoCompleto
          });

        if (error) {
          console.error('Erro ao inserir:', error);
          toast.error('Error recording consumption');
          return;
        }
      }

      setConsumoAtual(novoConsumo);
      
      if (habitoCompleto) {
        toast.success("Daily goal completed! 🎉");
      } else {
        toast.success(`Cup ${novoConsumo} recorded! 🍵`);
      }
    } catch (error) {
      console.error('Erro ao marcar consumo:', error);
      toast.error('Error recording consumption');
    }
  };

  const removeConsumption = async () => {
    if (!chaJaroHabito || consumoAtual <= 0) {
      return;
    }

    const novoConsumo = consumoAtual - 1;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('habito_id', chaJaroHabito.id)
        .eq('data', hoje)
        .maybeSingle();

      if (existing) {
        if (novoConsumo === 0) {
          // Remover registro se não há mais consumo
          await supabase
            .from('historico_habitos')
            .delete()
            .eq('id', existing.id);
        } else {
          // Atualizar quantidade
          await supabase
            .from('historico_habitos')
            .update({ 
              quantidade: novoConsumo,
              concluido: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        }

        setConsumoAtual(novoConsumo);
        toast.success("Consumption removed");
      }
    } catch (error) {
      console.error('Erro ao remover consumo:', error);
      toast.error('Error removing consumption');
    }
  };

  const ingredients = [
    { name: "Hibiscus", amount: "1 tablespoon", benefit: "Boosts metabolism" },
    { name: "Cinnamon stick", amount: "1 small stick", benefit: "Controls blood sugar" },
    { name: "Fresh ginger", amount: "3 thin slices", benefit: "Thermogenic effect" },
    { name: "Lemon", amount: "Juice of 1/2 lemon", benefit: "Rich in vitamin C" },
    { name: "Water", amount: "500ml", benefit: "Essential hydration" }
  ];

  const preparationSteps = [
    {
      step: 1,
      title: "Prepare ingredients",
      description: "Peel and slice ginger thinly. Separate hibiscus and cinnamon stick.",
      time: "2 min",
      tip: "Use fresh ginger to enhance the thermogenic effect"
    },
    {
      step: 2,
      title: "Boil water",
      description: "Put 500ml of water in a pot and bring to high heat until it reaches full boiling.",
      time: "5 min",
      tip: "Water should be vigorously boiling to better extract nutrients"
    },
    {
      step: 3,
      title: "Add hibiscus and cinnamon",
      description: "Turn off heat and add hibiscus and cinnamon stick. Cover pot and let steep.",
      time: "10 min",
      tip: "Don't boil hibiscus directly to preserve its properties"
    },
    {
      step: 4,
      title: "Include ginger",
      description: "After 5 minutes of steeping, add ginger slices and cover again.",
      time: "5 min",
      tip: "Adding ginger later keeps its flavor milder"
    },
    {
      step: 5,
      title: "Strain and finish",
      description: "Strain tea into a pitcher or cup, add fresh lemon juice and mix well.",
      time: "2 min",
      tip: "Add lemon only at the end to preserve vitamin C"
    },
    {
      step: 6,
      title: "Serve properly",
      description: "Consume warm or cold. If you prefer cold, let it cool before refrigerating.",
      time: "0 min",
      tip: "Avoid sweetening to maximize weight loss effects"
    }
  ];

  const benefits = [
    { icon: Zap, title: "Boosts Metabolism", description: "Increases calorie burn by up to 15%" },
    { icon: Heart, title: "Improves Circulation", description: "Hibiscus promotes blood circulation" },
    { icon: Droplets, title: "Diuretic Effect", description: "Eliminates toxins and reduces bloating" },
    { icon: Leaf, title: "Natural Antioxidant", description: "Fights free radicals and aging" }
  ];

  if (loading) {
    return (
      <Layout title="Jaro Tea - Natural Fat Burner" breadcrumb={["Home", "Jaro Tea"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Jaro Tea - Natural Fat Burner" breadcrumb={["Home", "Jaro Tea"]}>
      <div className="space-y-8">
        {/* Image and Introduction */}
        <Card className="bg-gradient-to-r from-green-500/20 to-transparent border-green-500/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  🍵 Jaro Tea
                </h1>
                <p className="text-white/80 text-base sm:text-lg mb-3 sm:mb-4">
                  The powerful natural ally for your weight loss! A special combination of thermogenic ingredients 
                  that accelerate metabolism and enhance fat burning.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm">
                    🔥 Thermogenic
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm">
                    💧 Diuretic
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm">
                    🌿 100% Natural
                  </Badge>
                </div>
              </div>
              <div className="h-48 sm:h-64 lg:h-auto bg-gradient-to-br from-green-400/20 via-red-400/20 to-orange-400/20 flex items-center justify-center">
                <div className="text-6xl sm:text-8xl">🍵</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              Daily Consumption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-white/80 text-sm sm:text-base">Today's progress</span>
              <span className="text-green-500 font-bold text-lg sm:text-xl">{consumoAtual}/{dailyGoal} cups</span>
            </div>
            <Progress value={progressPercentage} className="h-2 sm:h-3" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-white/60 text-xs sm:text-sm flex-1">
                {consumoAtual < dailyGoal 
                  ? `${dailyGoal - consumoAtual} cup(s) left to complete your goal!`
                  : "🎉 Daily goal achieved! Congratulations!"
                }
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                {consumoAtual > 0 && (
                  <Button
                    onClick={removeConsumption}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                )}
                <Button
                  onClick={markConsumption}
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600 flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2"
                  disabled={consumoAtual >= dailyGoal || loading}
                >
                  {consumoAtual >= dailyGoal ? "✓ Completed" : "Mark Consumption"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Ingredients and Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{ingredient.name}</h4>
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      {ingredient.amount}
                    </Badge>
                  </div>
                  <p className="text-white/60 text-sm">{ingredient.benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Preparation */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Complete Preparation Method
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-white/70">
                <Clock className="w-4 h-4" />
                Total time: ~25 min
              </div>
              <div className="flex items-center gap-1 text-white/70">
                <Thermometer className="w-4 h-4" />
                Difficulty: Easy
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {preparationSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{step.title}</h4>
                      <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                        {step.time}
                      </Badge>
                    </div>
                    <p className="text-white/80 mb-2">{step.description}</p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"  />
                        <p className="text-blue-400 text-sm"><strong>Tip:</strong> {step.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-500" />
              Main Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <benefit.icon className="w-6 h-6 text-green-500" />
                    <h4 className="text-white font-medium">{benefit.title}</h4>
                  </div>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Recommendations */}
        <Card className="bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              💡 Important Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Ideal times:</strong> Morning on empty stomach, before lunch and before dinner</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Maximum consumption:</strong> 3 cups per day to avoid excess</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Contraindications:</strong> Avoid with high blood pressure, kidney problems or pregnancy</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/80"><strong>Storage:</strong> Can be stored in refrigerator for up to 2 days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChaJaro;

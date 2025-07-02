import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Thermometer, Droplets, Leaf, CheckCircle, Info, Zap, Heart } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useHabitos } from "@/hooks/useHabitos";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ChaJaro = () => {
  const { user } = useAuth();
  const { getHabitosHoje, loading, carregarHabitos } = useHabitos();
  const [chaJaroHabito, setChaJaroHabito] = useState<any>(null);
  const [consumoAtual, setConsumoAtual] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);

  // Effect to find and set tea habit
  useEffect(() => {
    console.log('🔍 Buscando hábito de chá...');
    const habitosHoje = getHabitosHoje();
    const searchTerms = ['Chá Jaro', 'Tomar todas as doses de chá', 'chá', 'tea'];
    const chaJaro = habitosHoje.find(h => 
      searchTerms.some(term => 
        h.nome.toLowerCase().includes(term.toLowerCase())
      )
    );
    console.log('🍵 Hábito encontrado:', chaJaro);
    setChaJaroHabito(chaJaro);
  }, [getHabitosHoje]);

  const dailyGoal = chaJaroHabito?.meta_diaria || 2;
  const progressPercentage = (consumoAtual / dailyGoal) * 100;

  // Function to fetch current consumption
  const buscarConsumoAtual = useCallback(async () => {
    if (!chaJaroHabito || !user) return;
    
    try {
      console.log('📊 Buscando consumo atual para hábito:', chaJaroHabito.id);
      const hoje = new Date().toISOString().split('T')[0];
      
      // First, clean up any duplicate records for today
      const { data: allRecords } = await supabase
        .from('historico_habitos')
        .select('id, quantidade, created_at')
        .eq('user_email', user.email)
        .eq('habito_id', chaJaroHabito.id)
        .eq('data', hoje)
        .order('created_at', { ascending: false });

      if (allRecords && allRecords.length > 1) {
        // Keep only the most recent record, delete others
        const [mostRecent, ...duplicates] = allRecords;
        if (duplicates.length > 0) {
          const duplicateIds = duplicates.map(d => d.id);
          await supabase
            .from('historico_habitos')
            .delete()
            .in('id', duplicateIds);
          console.log('🧹 Removidos registros duplicados:', duplicateIds.length);
        }
        setConsumoAtual(mostRecent.quantidade || 0);
      } else if (allRecords && allRecords.length === 1) {
        setConsumoAtual(allRecords[0].quantidade || 0);
      } else {
        setConsumoAtual(0);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar consumo atual:', error);
      setConsumoAtual(0);
    }
  }, [chaJaroHabito, user]);

  // Effect to fetch consumption when habit is found
  useEffect(() => {
    if (chaJaroHabito && user) {
      buscarConsumoAtual();
    }
  }, [chaJaroHabito, user, buscarConsumoAtual]);

  const markConsumption = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to track consumption");
      return;
    }

    if (!chaJaroHabito) {
      toast.error("Tea habit not found");
      return;
    }

    if (consumoAtual >= dailyGoal) {
      toast.success("Daily goal already achieved! 🎉");
      return;
    }

    if (loadingAction) return; // Prevent multiple clicks

    setLoadingAction(true);
    const novoConsumo = consumoAtual + 1;
    const habitoCompleto = novoConsumo >= dailyGoal;

    try {
      console.log('📝 Marcando consumo:', novoConsumo, 'de', dailyGoal);
      const hoje = new Date().toISOString().split('T')[0];
      
      // Check for existing record
      const { data: existing, error: selectError } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('user_email', user.email)
        .eq('habito_id', chaJaroHabito.id)
        .eq('data', hoje)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erro ao buscar registro existente:', selectError);
        toast.error('Error checking existing records');
        return;
      }

      let updateResult;
      if (existing) {
        // Update existing record
        console.log('🔄 Atualizando registro existente:', existing.id);
        updateResult = await supabase
          .from('historico_habitos')
          .update({ 
            quantidade: novoConsumo,
            concluido: habitoCompleto,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        console.log('✨ Criando novo registro');
        updateResult = await supabase
          .from('historico_habitos')
          .insert({
            user_email: user.email,
            habito_id: chaJaroHabito.id,
            data: hoje,
            quantidade: novoConsumo,
            concluido: habitoCompleto
          });
      }

      if (updateResult.error) {
        console.error('❌ Erro ao salvar:', updateResult.error);
        toast.error('Error saving consumption');
        return;
      }

      // Update local state
      setConsumoAtual(novoConsumo);
      
      // Reload habits to sync with Habit Tracker
      await carregarHabitos();
      
      // Success message
      if (habitoCompleto) {
        toast.success("Daily goal completed! 🎉");
      } else {
        toast.success(`Cup ${novoConsumo} recorded! 🍵`);
      }

      console.log('✅ Consumo marcado com sucesso');
    } catch (error) {
      console.error('❌ Erro inesperado ao marcar consumo:', error);
      toast.error('Unexpected error recording consumption');
    } finally {
      setLoadingAction(false);
    }
  }, [user, chaJaroHabito, consumoAtual, dailyGoal, loadingAction, carregarHabitos]);

  const removeConsumption = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to modify consumption");
      return;
    }

    if (!chaJaroHabito || consumoAtual <= 0) {
      return;
    }

    if (loadingAction) return; // Prevent multiple clicks

    setLoadingAction(true);
    const novoConsumo = consumoAtual - 1;

    try {
      console.log('🗑️ Removendo consumo:', consumoAtual, '->', novoConsumo);
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: existing, error: selectError } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('user_email', user.email)
        .eq('habito_id', chaJaroHabito.id)
        .eq('data', hoje)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erro ao buscar registro:', selectError);
        toast.error('Error finding consumption record');
        return;
      }

      if (existing) {
        let updateResult;
        if (novoConsumo === 0) {
          // Remove record if no consumption left
          console.log('🗑️ Removendo registro completamente');
          updateResult = await supabase
            .from('historico_habitos')
            .delete()
            .eq('id', existing.id);
        } else {
          // Update quantity
          console.log('🔄 Atualizando quantidade para:', novoConsumo);
          updateResult = await supabase
            .from('historico_habitos')
            .update({ 
              quantidade: novoConsumo,
              concluido: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        }

        if (updateResult.error) {
          console.error('❌ Erro ao remover/atualizar:', updateResult.error);
          toast.error('Error updating consumption');
          return;
        }

        // Update local state
        setConsumoAtual(novoConsumo);
        
        // Reload habits to sync with Habit Tracker
        await carregarHabitos();
        
        toast.success("Consumption removed");
        console.log('✅ Consumo removido com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao remover consumo:', error);
      toast.error('Unexpected error removing consumption');
    } finally {
      setLoadingAction(false);
    }
  }, [user, chaJaroHabito, consumoAtual, loadingAction, carregarHabitos]);

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
                    disabled={loadingAction}
                  >
                    {loadingAction ? "..." : "Remove"}
                  </Button>
                )}
                <Button
                  onClick={markConsumption}
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600 flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2"
                  disabled={consumoAtual >= dailyGoal || loading || loadingAction}
                >
                  {loadingAction ? "..." : consumoAtual >= dailyGoal ? "✓ Completed" : "Mark Consumption"}
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

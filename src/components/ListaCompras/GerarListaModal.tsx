
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSupabaseReceitas } from "@/hooks/useSupabaseReceitas";
import { supabase } from "@/integrations/supabase/client";

interface ItemSugerido {
  nome: string;
  quantidade: string;
  preco: number;
  categoria: string;
  selecionado: boolean;
  aparicoes: number;
  ingredientesOriginais: string[];
}

interface GerarListaModalProps {
  refeicao: string;
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  onAddItens: (itens: ItemSugerido[]) => void;
}

export function GerarListaModal({ 
  refeicao, 
  preferenciasAlimentares, 
  restricoesAlimentares, 
  onAddItens 
}: GerarListaModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itensSugeridos, setItensSugeridos] = useState<ItemSugerido[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    originalCount: number;
    optimizedCount: number;
    consolidationRate: number;
  } | null>(null);
  
  const { receitas } = useSupabaseReceitas();

  const gerarLista = async () => {
    setIsGenerating(true);
    
    const loadingToast = toast.loading("🤖 AI optimizing your shopping list...", { 
      duration: 15000,
      description: "Consolidating ingredients and calculating smart quantities..."
    });
    
    try {
      // Get recipes for the specific meal
      const receitasRefeicao = receitas[refeicao] || [];
      
      if (receitasRefeicao.length === 0) {
        toast.dismiss(loadingToast);
        toast.error(`No recipes found for ${refeicao}. Please create some recipes first!`);
        setIsGenerating(false);
        return;
      }

      console.log('🍳 Calling AI optimization for shopping list:', {
        refeicao,
        receitasCount: receitasRefeicao.length,
        preferenciasAlimentares,
        restricoesAlimentares
      });

      // Call the edge function for AI optimization
      const { data, error } = await supabase.functions.invoke('optimize-shopping-list', {
        body: {
          receitas: receitasRefeicao.map(receita => ({
            nome: receita.nome,
            ingredientes: receita.ingredientes || []
          })),
          preferenciasAlimentares: preferenciasAlimentares || 'none',
          restricoesAlimentares: restricoesAlimentares || [],
          refeicao
        }
      });

      if (error) {
        console.error('❌ Error calling optimization function:', error);
        throw new Error('Failed to optimize shopping list');
      }

      console.log('✅ AI optimization completed:', data);

      const { optimizedItems, originalCount, optimizedCount, consolidationRate } = data;

      if (!optimizedItems || optimizedItems.length === 0) {
        toast.dismiss(loadingToast);
        toast.error(`No ingredients found in ${refeicao} recipes.`);
        setIsGenerating(false);
        return;
      }

      // Convert to frontend format
      const itensGerados: ItemSugerido[] = optimizedItems.map((item: any) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: 0, // Always start with 0 for user input
        categoria: item.categoria || 'general',
        selecionado: true,
        aparicoes: item.aparicoes || 1,
        ingredientesOriginais: item.ingredientesOriginais || []
      }));

      setItensSugeridos(itensGerados);
      setOptimizationStats({ originalCount, optimizedCount, consolidationRate });
      setShowResults(true);
      
      toast.dismiss(loadingToast);
      toast.success(`🧠 AI optimized your list!`, {
        description: `Consolidated ${originalCount} ingredients into ${optimizedCount} items (${consolidationRate}% reduction)`
      });

    } catch (error) {
      console.error('🚨 Error generating optimized list:', error);
      toast.dismiss(loadingToast);
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          toast.error("🔑 API Key Required", {
            description: "Please configure your OpenAI API key in settings to generate optimized lists."
          });
        } else {
          toast.error("🤖 AI Optimization Failed", {
            description: "Unable to optimize list. Please try again."
          });
        }
      } else {
        toast.error("❌ Unexpected Error", {
          description: "An unexpected error occurred. Please try again."
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItem = (index: number) => {
    setItensSugeridos(prev => prev.map((item, i) => 
      i === index ? { ...item, selecionado: !item.selecionado } : item
    ));
  };

  const updatePreco = (index: number, novoPreco: string) => {
    const precoNumerico = parseFloat(novoPreco) || 0;
    setItensSugeridos(prev => prev.map((item, i) => 
      i === index ? { ...item, preco: precoNumerico } : item
    ));
  };

  const adicionarItens = () => {
    const itensSelecionados = itensSugeridos.filter(item => item.selecionado);
    if (itensSelecionados.length === 0) {
      toast.error("Select at least one item!");
      return;
    }
    
    onAddItens(itensSelecionados);
    toast.success(`${itensSelecionados.length} optimized items added to ${refeicao} list!`);
    setShowResults(false);
    setItensSugeridos([]);
    setOptimizationStats(null);
  };

  const resetModal = () => {
    setShowResults(false);
    setItensSugeridos([]);
    setOptimizationStats(null);
    setIsGenerating(false);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          AI Optimize List
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">🤖 AI-Powered Shopping List for {refeicao}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showResults && !isGenerating && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">AI Optimization Settings:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-white/60">Meal:</span>
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                      {refeicao}
                    </Badge>
                  </div>
                  {preferenciasAlimentares && (
                    <div className="flex gap-2">
                      <span className="text-white/60">Preference:</span>
                      <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                        {preferenciasAlimentares}
                      </Badge>
                    </div>
                  )}
                  {restricoesAlimentares.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-white/60">Restrictions:</span>
                      {restricoesAlimentares.map((restricao, index) => (
                        <Badge key={index} variant="outline" className="border-orange-400/30 text-orange-400">
                          {restricao}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 p-3 bg-neon-green/10 rounded border border-neon-green/20">
                  <p className="text-neon-green text-sm">
                    🧠 AI will analyze your recipes, consolidate similar ingredients, and suggest optimized quantities for maximum efficiency and cost savings.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={gerarLista}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is optimizing...
                  </>
                ) : (
                  "🤖 Generate AI-Optimized List"
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">AI is analyzing and optimizing ingredients from your {refeicao.toLowerCase()} recipes...</p>
              <p className="text-white/60 text-sm mt-2">Consolidating duplicates and calculating smart quantities...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">
                  AI-Optimized Ingredients ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length} selected):
                </h4>
                {optimizationStats && (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    {optimizationStats.consolidationRate}% consolidation
                  </Badge>
                )}
              </div>
              
              {optimizationStats && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white/80 text-sm">
                    🎯 Optimized {optimizationStats.originalCount} original ingredients into {optimizationStats.optimizedCount} consolidated items
                  </p>
                </div>
              )}
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {itensSugeridos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <Checkbox
                      checked={item.selecionado}
                      onCheckedChange={() => toggleItem(index)}
                      className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium flex items-center gap-2">
                        {item.nome}
                        {item.aparicoes > 1 && (
                          <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs">
                            Used {item.aparicoes}x
                          </Badge>
                        )}
                      </div>
                      <div className="text-white/60 text-sm">{item.quantidade}</div>
                      {item.ingredientesOriginais && item.ingredientesOriginais.length > 1 && (
                        <div className="text-white/40 text-xs mt-1">
                          Consolidated: {item.ingredientesOriginais.slice(0, 3).join(', ')}
                          {item.ingredientesOriginais.length > 3 && ` +${item.ingredientesOriginais.length - 3} more`}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-xs">
                      {item.categoria}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.preco > 0 ? item.preco.toString() : ""}
                        onChange={(e) => updatePreco(index, e.target.value)}
                        className="w-20 h-8 bg-white/10 border-white/20 text-white text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={adicionarItens}
                  className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
                >
                  Add Selected Items
                </Button>
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  Generate New List
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

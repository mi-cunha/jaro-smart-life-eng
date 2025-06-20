
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSupabaseReceitas } from "@/hooks/useSupabaseReceitas";

interface ItemSugerido {
  nome: string;
  quantidade: string;
  preco: number;
  categoria: string;
  selecionado: boolean;
}

interface GerarListaModalProps {
  onAddItens: (itens: ItemSugerido[]) => void;
}

export function GerarListaModal({ onAddItens }: GerarListaModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itensSugeridos, setItensSugeridos] = useState<ItemSugerido[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { receitas } = useSupabaseReceitas();

  const gerarLista = async () => {
    setIsGenerating(true);
    
    const loadingToast = toast.loading("Generating shopping list...", { 
      duration: 3000,
      description: "Processing your favorite recipes..."
    });
    
    try {
      // Get all favorite recipes from all meals
      const receitasFavoritas = Object.values(receitas)
        .flat()
        .filter(receita => receita.favorita);
      
      if (receitasFavoritas.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No favorite recipes found. Please mark some recipes as favorites first!");
        setIsGenerating(false);
        return;
      }

      console.log('📋 Generating list from favorite recipes:', {
        favoritesCount: receitasFavoritas.length
      });

      // Extract all ingredients from favorite recipes
      const allIngredients = receitasFavoritas.flatMap(receita => 
        (receita.ingredientes || []).map(ingrediente => ({
          original: ingrediente,
          receita: receita.nome
        }))
      );

      if (allIngredients.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No ingredients found in favorite recipes.");
        setIsGenerating(false);
        return;
      }

      // Simple consolidation by ingredient name
      const ingredientMap = new Map<string, {
        quantidade: string;
        categoria: string;
        count: number;
      }>();

      allIngredients.forEach(({ original }) => {
        const normalized = original.toLowerCase().trim();
        const existing = ingredientMap.get(normalized);
        
        if (existing) {
          existing.count++;
        } else {
          // Simple categorization
          let categoria = 'general';
          if (normalized.includes('meat') || normalized.includes('chicken') || normalized.includes('beef') || normalized.includes('fish')) {
            categoria = 'proteins';
          } else if (normalized.includes('rice') || normalized.includes('bread') || normalized.includes('pasta')) {
            categoria = 'grains';
          } else if (normalized.includes('milk') || normalized.includes('cheese') || normalized.includes('yogurt')) {
            categoria = 'dairy';
          } else if (normalized.includes('apple') || normalized.includes('banana') || normalized.includes('orange')) {
            categoria = 'fruits';
          } else if (normalized.includes('tomato') || normalized.includes('onion') || normalized.includes('carrot')) {
            categoria = 'vegetables';
          }

          ingredientMap.set(normalized, {
            quantidade: '1 unit',
            categoria,
            count: 1
          });
        }
      });

      // Convert to frontend format
      const itensGerados: ItemSugerido[] = Array.from(ingredientMap.entries()).map(([nome, data]) => ({
        nome: nome.charAt(0).toUpperCase() + nome.slice(1),
        quantidade: data.count > 2 ? `${data.count} units` : data.quantidade,
        preco: 0.00,
        categoria: data.categoria,
        selecionado: true
      }));

      setItensSugeridos(itensGerados);
      setShowResults(true);
      
      toast.dismiss(loadingToast);
      toast.success(`Shopping list generated!`, {
        description: `Found ${itensGerados.length} items from ${receitasFavoritas.length} favorite recipes`
      });

    } catch (error) {
      console.error('🚨 Error generating list:', error);
      toast.dismiss(loadingToast);
      toast.error("Error generating list", {
        description: "Please try again."
      });
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
    toast.success(`${itensSelecionados.length} items added to shopping list!`);
    setShowResults(false);
    setItensSugeridos([]);
  };

  const resetModal = () => {
    setShowResults(false);
    setItensSugeridos([]);
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
          Generate List
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">📋 Generate Shopping List</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showResults && !isGenerating && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Shopping List Generation</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-neon-green/10 rounded border border-neon-green/20">
                    <p className="text-neon-green text-sm">
                      📋 Your shopping list will be generated based on all your favorite recipes across all meals.
                    </p>
                  </div>
                  <p className="text-white/60">
                    The system will collect all ingredients from your marked favorite recipes and organize them by category with suggested quantities.
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
                    Generating list...
                  </>
                ) : (
                  "📋 Generate Shopping List"
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">Processing your favorite recipes...</p>
              <p className="text-white/60 text-sm mt-2">Organizing ingredients by category...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">
                  Generated Items ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length} selected):
                </h4>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {itensSugeridos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <Checkbox
                      checked={item.selecionado}
                      onCheckedChange={() => toggleItem(index)}
                      className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">
                        {item.nome}
                      </div>
                      <div className="text-white/60 text-sm">{item.quantidade}</div>
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

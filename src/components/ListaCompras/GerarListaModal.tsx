
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
  aparicoes: number; // Quantas vezes aparece nas receitas
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
  
  const { receitas } = useSupabaseReceitas();

  const gerarLista = async () => {
    setIsGenerating(true);
    
    const toastId = toast.loading("Generating optimized list from your recipes...", { duration: 2000 });
    
    setTimeout(() => {
      toast.dismiss(toastId);
      
      try {
        // Get recipes for the specific meal
        const receitasRefeicao = receitas[refeicao] || [];
        
        if (receitasRefeicao.length === 0) {
          toast.error(`No recipes found for ${refeicao}. Please create some recipes first!`);
          setIsGenerating(false);
          return;
        }

        // Extract and count ingredients from user's recipes for this meal
        const ingredientesContador = new Map<string, number>();
        
        receitasRefeicao.forEach(receita => {
          if (receita.ingredientes && Array.isArray(receita.ingredientes)) {
            receita.ingredientes.forEach(ingrediente => {
              if (typeof ingrediente === 'string') {
                const ingredienteLimpo = ingrediente.trim().toLowerCase();
                ingredientesContador.set(
                  ingredienteLimpo, 
                  (ingredientesContador.get(ingredienteLimpo) || 0) + 1
                );
              }
            });
          }
        });

        if (ingredientesContador.size === 0) {
          toast.error(`No ingredients found in ${refeicao} recipes.`);
          setIsGenerating(false);
          return;
        }

        // Convert ingredients to optimized shopping list items
        const itensGerados = Array.from(ingredientesContador.entries()).map(([ingrediente, aparicoes]) => {
          // Smart categorization based on ingredient type
          let categoria = "general";
          let quantidadeSugerida = "1 unit";

          const ingredienteLower = ingrediente.toLowerCase();
          
          if (ingredienteLower.includes("chicken") || ingredienteLower.includes("beef") || 
              ingredienteLower.includes("fish") || ingredienteLower.includes("salmon") || 
              ingredienteLower.includes("egg") || ingredienteLower.includes("ovo")) {
            quantidadeSugerida = aparicoes > 2 ? "1kg" : "500g";
            categoria = "proteins";
          } else if (ingredienteLower.includes("rice") || ingredienteLower.includes("quinoa") || 
                     ingredienteLower.includes("oats") || ingredienteLower.includes("arroz")) {
            quantidadeSugerida = "1kg";
            categoria = "grains";
          } else if (ingredienteLower.includes("tomato") || ingredienteLower.includes("onion") || 
                     ingredienteLower.includes("carrot") || ingredienteLower.includes("broccoli") || 
                     ingredienteLower.includes("lettuce") || ingredienteLower.includes("cebola") ||
                     ingredienteLower.includes("tomate")) {
            quantidadeSugerida = aparicoes > 2 ? "1kg" : "500g";
            categoria = "vegetables";
          } else if (ingredienteLower.includes("apple") || ingredienteLower.includes("banana") || 
                     ingredienteLower.includes("orange") || ingredienteLower.includes("berry") ||
                     ingredienteLower.includes("maçã")) {
            quantidadeSugerida = aparicoes > 3 ? "2kg" : "1kg";
            categoria = "fruits";
          } else if (ingredienteLower.includes("milk") || ingredienteLower.includes("cheese") || 
                     ingredienteLower.includes("yogurt") || ingredienteLower.includes("leite")) {
            quantidadeSugerida = aparicoes > 1 ? "1L" : "500ml";
            categoria = "dairy";
          } else if (ingredienteLower.includes("oil") || ingredienteLower.includes("olive") ||
                     ingredienteLower.includes("óleo")) {
            quantidadeSugerida = "500ml";
            categoria = "oils";
          } else if (ingredienteLower.includes("salt") || ingredienteLower.includes("pepper") || 
                     ingredienteLower.includes("garlic") || ingredienteLower.includes("herb") ||
                     ingredienteLower.includes("sal") || ingredienteLower.includes("alho")) {
            quantidadeSugerida = "100g";
            categoria = "seasonings";
          }

          // Capitalize first letter for display
          const nomeFormatado = ingrediente.charAt(0).toUpperCase() + ingrediente.slice(1);

          return {
            nome: nomeFormatado,
            quantidade: quantidadeSugerida,
            preco: 0, // User will fill this
            categoria,
            selecionado: true,
            aparicoes
          };
        });

        // Filter based on dietary restrictions
        let itensFiltrados = itensGerados;
        
        if (preferenciasAlimentares === "vegan") {
          itensFiltrados = itensFiltrados.filter(item => 
            !["dairy", "proteins"].includes(item.categoria) || 
            item.nome.toLowerCase().includes("plant") || 
            item.nome.toLowerCase().includes("tofu")
          );
        }

        restricoesAlimentares.forEach(restricao => {
          if (restricao.toLowerCase().includes("lactose")) {
            itensFiltrados = itensFiltrados.filter(item => item.categoria !== "dairy");
          }
          if (restricao.toLowerCase().includes("gluten")) {
            itensFiltrados = itensFiltrados.filter(item => 
              !item.nome.toLowerCase().includes("wheat") && 
              !item.nome.toLowerCase().includes("bread") &&
              !item.nome.toLowerCase().includes("pasta")
            );
          }
        });

        // Sort by number of appearances (most used first)
        itensFiltrados.sort((a, b) => b.aparicoes - a.aparicoes);

        setItensSugeridos(itensFiltrados);
        setShowResults(true);
        setIsGenerating(false);
        toast.success(`Generated optimized list with ${itensFiltrados.length} unique ingredients!`);
      } catch (error) {
        setIsGenerating(false);
        toast.error("Error generating list. Please try again.");
      }
    }, 2000);
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
    toast.success(`${itensSelecionados.length} items added to ${refeicao} list!`);
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
          <DialogTitle className="text-white">Smart Shopping List for {refeicao}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showResults && !isGenerating && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Settings:</h4>
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
                    🧠 AI will optimize your list by consolidating duplicate ingredients and suggesting smart quantities based on recipe frequency.
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
                    Optimizing ingredients...
                  </>
                ) : (
                  "Generate Optimized Shopping List"
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">Analyzing and optimizing ingredients from your {refeicao.toLowerCase()} recipes...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">
                Optimized Ingredients ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length} selected):
              </h4>
              
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
                    </div>
                    <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-xs">
                      {item.categoria}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.preco || ""}
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

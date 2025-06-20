
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
    
    const toastId = toast.loading("Generating list from your recipes...", { duration: 2000 });
    
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

        // Extract all ingredients from user's recipes for this meal
        const ingredientesUnicos = new Set<string>();
        receitasRefeicao.forEach(receita => {
          if (receita.ingredientes && Array.isArray(receita.ingredientes)) {
            receita.ingredientes.forEach(ingrediente => {
              if (typeof ingrediente === 'string') {
                ingredientesUnicos.add(ingrediente.trim());
              }
            });
          }
        });

        if (ingredientesUnicos.size === 0) {
          toast.error(`No ingredients found in ${refeicao} recipes.`);
          setIsGenerating(false);
          return;
        }

        // Convert ingredients to shopping list items
        const itensGerados = Array.from(ingredientesUnicos).map(ingrediente => {
          // Generate realistic quantities and prices based on ingredient type
          let quantidade = "1 unit";
          let preco = 5.0;
          let categoria = "general";

          // Smart categorization and pricing
          const ingredienteLower = ingrediente.toLowerCase();
          
          if (ingredienteLower.includes("chicken") || ingredienteLower.includes("beef") || ingredienteLower.includes("fish") || ingredienteLower.includes("salmon")) {
            quantidade = "500g";
            preco = Math.floor(Math.random() * 20) + 15;
            categoria = "proteins";
          } else if (ingredienteLower.includes("rice") || ingredienteLower.includes("quinoa") || ingredienteLower.includes("oats")) {
            quantidade = "1kg";
            preco = Math.floor(Math.random() * 10) + 5;
            categoria = "grains";
          } else if (ingredienteLower.includes("tomato") || ingredienteLower.includes("onion") || ingredienteLower.includes("carrot") || ingredienteLower.includes("broccoli") || ingredienteLower.includes("lettuce")) {
            quantidade = "500g";
            preco = Math.floor(Math.random() * 8) + 3;
            categoria = "vegetables";
          } else if (ingredienteLower.includes("apple") || ingredienteLower.includes("banana") || ingredienteLower.includes("orange") || ingredienteLower.includes("berry")) {
            quantidade = "1kg";
            preco = Math.floor(Math.random() * 12) + 4;
            categoria = "fruits";
          } else if (ingredienteLower.includes("milk") || ingredienteLower.includes("cheese") || ingredienteLower.includes("yogurt")) {
            quantidade = "500ml";
            preco = Math.floor(Math.random() * 15) + 6;
            categoria = "dairy";
          } else if (ingredienteLower.includes("oil") || ingredienteLower.includes("olive")) {
            quantidade = "500ml";
            preco = Math.floor(Math.random() * 25) + 10;
            categoria = "oils";
          } else if (ingredienteLower.includes("salt") || ingredienteLower.includes("pepper") || ingredienteLower.includes("garlic") || ingredienteLower.includes("herb")) {
            quantidade = "100g";
            preco = Math.floor(Math.random() * 8) + 2;
            categoria = "seasonings";
          }

          return {
            nome: ingrediente,
            quantidade,
            preco,
            categoria,
            selecionado: true
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

        setItensSugeridos(itensFiltrados);
        setShowResults(true);
        setIsGenerating(false);
        toast.success(`Generated ${itensFiltrados.length} items from your recipes!`);
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
      <DialogContent className="bg-dark-bg border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Generate List for {refeicao}</DialogTitle>
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
                    📝 This will generate a shopping list based on ingredients from your existing {refeicao.toLowerCase()} recipes.
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
                    Generating from recipes...
                  </>
                ) : (
                  "Generate List from Your Recipes"
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">Extracting ingredients from your {refeicao.toLowerCase()} recipes...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">
                Ingredients from Your Recipes ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length}):
              </h4>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {itensSugeridos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Checkbox
                      checked={item.selecionado}
                      onCheckedChange={() => toggleItem(index)}
                      className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.nome}</div>
                      <div className="text-white/60 text-sm">{item.quantidade}</div>
                    </div>
                    <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs">
                      {item.categoria}
                    </Badge>
                    <div className="text-neon-green font-medium">
                      ${item.preco.toFixed(2)}
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


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  const gerarLista = async () => {
    setIsGenerating(true);
    toast.loading("Generating personalized list...", { duration: 3000 });
    
    setTimeout(() => {
      // Simulation of generation based on meal and preferences
      const itensBase = {
        "Breakfast": [
          { nome: "Organic Rolled Oats", quantidade: "500g", preco: 6.50, categoria: "cereals" },
          { nome: "Organic Bananas", quantidade: "1kg", preco: 5.20, categoria: "fruits" },
          { nome: "Natural Low-Fat Yogurt", quantidade: "500ml", preco: 7.80, categoria: "dairy" },
          { nome: "Organic Honey", quantidade: "250ml", preco: 18.90, categoria: "sweeteners" },
          { nome: "Chia Seeds", quantidade: "200g", preco: 15.60, categoria: "seeds" },
          { nome: "Fresh Blueberries", quantidade: "200g", preco: 12.90, categoria: "fruits" },
          { nome: "Almond Milk", quantidade: "1L", preco: 8.90, categoria: "beverages" }
        ],
        "Lunch": [
          { nome: "Organic Chicken Breast", quantidade: "1kg", preco: 18.90, categoria: "proteins" },
          { nome: "Tricolor Quinoa", quantidade: "500g", preco: 14.80, categoria: "grains" },
          { nome: "Fresh Broccoli", quantidade: "500g", preco: 6.20, categoria: "vegetables" },
          { nome: "Sweet Potato", quantidade: "1kg", preco: 7.50, categoria: "carbohydrates" },
          { nome: "Extra Virgin Olive Oil", quantidade: "500ml", preco: 22.90, categoria: "oils" },
          { nome: "Cherry Tomatoes", quantidade: "300g", preco: 5.80, categoria: "vegetables" },
          { nome: "Natural Coconut Water", quantidade: "1L", preco: 4.50, categoria: "beverages" }
        ],
        "Snack": [
          { nome: "Mixed Nuts", quantidade: "200g", preco: 24.90, categoria: "nuts" },
          { nome: "Green Apples", quantidade: "1kg", preco: 8.90, categoria: "fruits" },
          { nome: "Cottage Cheese", quantidade: "200g", preco: 9.80, categoria: "dairy" },
          { nome: "Green Tea", quantidade: "20 bags", preco: 12.50, categoria: "beverages" },
          { nome: "Whole Grain Crackers", quantidade: "200g", preco: 6.90, categoria: "snacks" }
        ],
        "Dinner": [
          { nome: "Fresh Salmon", quantidade: "500g", preco: 34.90, categoria: "proteins" },
          { nome: "Fresh Asparagus", quantidade: "300g", preco: 15.80, categoria: "vegetables" },
          { nome: "Zucchini", quantidade: "500g", preco: 4.20, categoria: "vegetables" },
          { nome: "Shiitake Mushrooms", quantidade: "200g", preco: 12.90, categoria: "vegetables" },
          { nome: "Sicilian Lemon", quantidade: "500g", preco: 3.80, categoria: "fruits" },
          { nome: "Fresh Herbs", quantidade: "1 bunch", preco: 2.90, categoria: "seasonings" },
          { nome: "Mineral Water", quantidade: "1.5L", preco: 2.50, categoria: "beverages" }
        ]
      };

      let itens = itensBase[refeicao as keyof typeof itensBase] || [];
      
      // Adjust based on preferences
      if (preferenciasAlimentares === "vegan") {
        itens = itens.filter(item => !["dairy", "proteins"].includes(item.categoria) || 
          item.nome.includes("Plant") || item.nome.includes("Tofu"));
      }

      // Filter restrictions
      restricoesAlimentares.forEach(restricao => {
        if (restricao.toLowerCase().includes("lactose")) {
          itens = itens.filter(item => item.categoria !== "dairy");
        }
        if (restricao.toLowerCase().includes("gluten")) {
          itens = itens.filter(item => !item.nome.toLowerCase().includes("oats") && 
            !item.nome.toLowerCase().includes("crackers"));
        }
      });

      const itensSelecionados = itens.slice(0, 7).map(item => ({
        ...item,
        selecionado: true
      }));

      setItensSugeridos(itensSelecionados);
      setShowResults(true);
      setIsGenerating(false);
      toast.success("List generated successfully!");
    }, 3000);
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
              </div>
              
              <Button 
                onClick={gerarLista}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
              >
                Generate Personalized List
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">Generating personalized list based on your preferences...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">
                Suggested Items ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length}):
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

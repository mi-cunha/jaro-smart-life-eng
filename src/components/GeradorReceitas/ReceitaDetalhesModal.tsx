
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, ChefHat, X } from "lucide-react";
import { Receita } from "@/types/receitas";

interface ReceitaDetalhesModalProps {
  receita: Receita | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceitaDetalhesModal({ receita, isOpen, onClose }: ReceitaDetalhesModalProps) {
  if (!receita) return null;

  // Ensure we have valid instructions and macros
  const instrucoes = receita.preparo && receita.preparo.length > 0 ? receita.preparo : [
    "Prepare all ingredients according to the recipe requirements.",
    "Follow basic cooking methods appropriate for the ingredients.",
    "Season to taste and serve as desired."
  ];

  const macros = receita.macros || {
    proteinas: 15,
    carboidratos: 25,
    gorduras: 8
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-bg border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-white text-lg md:text-2xl font-bold leading-tight pr-8">{receita.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Information badges */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="border-neon-green/30 text-neon-green px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              {receita.tempo} min
            </Badge>
            <Badge variant="outline" className="border-orange-400/30 text-orange-400 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              {receita.calorias} kcal
            </Badge>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 px-3 py-1">
              {receita.refeicao}
            </Badge>
          </div>

          {/* Ingredients Section */}
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full"></div>
              Ingredients:
            </h4>
            <div className="space-y-2">
              {receita.ingredientes.map((ingrediente, index) => (
                <div key={index} className="text-white/90 flex items-center gap-3 text-base">
                  <div className="w-1.5 h-1.5 bg-neon-green rounded-full flex-shrink-0" />
                  {ingrediente}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full"></div>
              Instructions:
            </h4>
            <div className="space-y-3">
              {instrucoes.map((passo, index) => (
                <div key={index} className="text-white/90 flex gap-4 text-base">
                  <span className="text-neon-green font-bold text-lg min-w-[32px] flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span className="leading-relaxed">{passo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutritional Information */}
          <div className="bg-white/5 rounded-lg p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full"></div>
              Nutritional Information:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 p-4 rounded-lg text-center border border-white/20">
                <div className="text-2xl font-bold text-neon-green mb-1">
                  {receita.calorias}
                </div>
                <div className="text-white/70 text-sm">Calories</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {macros.proteinas}g
                </div>
                <div className="text-white/70 text-sm">Protein</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {macros.carboidratos}g
                </div>
                <div className="text-white/70 text-sm">Carbs</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg text-center border border-white/20">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {macros.gorduras}g
                </div>
                <div className="text-white/70 text-sm">Fat</div>
              </div>
            </div>
          </div>

          {/* Extra Tips */}
          <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-6">
            <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              💡 Tips:
            </h4>
            <div className="space-y-2 text-white/80">
              <p>• Use fresh, high-quality ingredients for best results</p>
              <p>• Adjust seasonings to your personal taste preferences</p>
              <p>• This recipe can be prepared ahead of time for meal prep</p>
              {receita.refeicao === "Breakfast" && (
                <p>• Perfect way to start your day with balanced nutrition</p>
              )}
              {receita.refeicao === "Lunch" && (
                <p>• Great source of sustained energy for your afternoon</p>
              )}
              {receita.refeicao === "Dinner" && (
                <p>• Light enough for evening while still satisfying</p>
              )}
              {receita.refeicao === "Snack" && (
                <p>• Perfect portion for a healthy between-meal snack</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

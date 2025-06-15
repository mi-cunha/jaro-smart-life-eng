
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RecomendacoesNutricionais } from "@/services/recomendacoesNutricionais";

interface SugerirItemModalProps {
  refeicoes: string[];
  onAddIngrediente: (refeicao: string, item: string) => void;
}

export function SugerirItemModal({ refeicoes, onAddIngrediente }: SugerirItemModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState(refeicoes[0]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.length > 2) {
      const itemEhSaudavel = RecomendacoesNutricionais.verificarSeItemEhSaudavel(value);
      setShowWarning(!itemEhSaudavel);
      
      const novasSugestoes = RecomendacoesNutricionais.obterRecomendacoesPorPalavraChave(value);
      setSugestoes(novasSugestoes);
    } else {
      setSugestoes([]);
      setShowWarning(false);
    }
  };

  const adicionarItem = (item: string) => {
    if (!item.trim()) {
      toast.error("Enter an item name!");
      return;
    }

    const itemEhSaudavel = RecomendacoesNutricionais.verificarSeItemEhSaudavel(item);
    
    if (!itemEhSaudavel) {
      toast.error("⚠️ This item is not recommended by nutritionists for a healthy diet!");
      return;
    }

    onAddIngrediente(refeicaoSelecionada, item);
    
    const dica = RecomendacoesNutricionais.obterDicaNutricional(item);
    toast.success(`✅ ${item} added! ${dica}`);
    
    setInputValue("");
    setSugestoes([]);
    setShowWarning(false);
  };

  const resetModal = () => {
    setInputValue("");
    setSugestoes([]);
    setShowWarning(false);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Suggest Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Suggest Healthy Item
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Meal:
            </label>
            <div className="flex gap-2 flex-wrap">
              {refeicoes.map((refeicao) => (
                <Button
                  key={refeicao}
                  onClick={() => setRefeicaoSelecionada(refeicao)}
                  variant={refeicaoSelecionada === refeicao ? "default" : "outline"}
                  size="sm"
                  className={refeicaoSelecionada === refeicao 
                    ? "bg-neon-green text-black" 
                    : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {refeicao}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Item Name:
            </label>
            <div className="space-y-2">
              <Input
                placeholder="Enter item name..."
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && adicionarItem(inputValue)}
              />
              
              {showWarning && (
                <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">
                    Item not recommended for healthy diets. See alternatives below.
                  </span>
                </div>
              )}
            </div>
          </div>

          {sugestoes.length > 0 && (
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Healthy Suggestions:
              </label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {sugestoes.map((sugestao, index) => (
                  <Button
                    key={index}
                    onClick={() => adicionarItem(sugestao)}
                    variant="outline"
                    size="sm"
                    className="justify-between border-green-400/30 text-green-400 hover:bg-green-400/10 h-auto p-3"
                  >
                    <span className="text-left">{sugestao}</span>
                    <Plus className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => adicionarItem(inputValue)}
              className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
              disabled={!inputValue.trim()}
            >
              Add Item
            </Button>
          </div>

          <div className="text-xs text-white/60 p-2 bg-blue-500/10 border border-blue-500/30 rounded-md">
            💡 <strong>Tip:</strong> We prioritize natural and minimally processed foods for healthier and more nutritious eating.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

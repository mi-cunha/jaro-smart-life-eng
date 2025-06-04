
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, ChefHat } from "lucide-react";
import { Receita } from "@/types/receitas";

interface ReceitaDetalhesModalProps {
  receita: Receita | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceitaDetalhesModal({ receita, isOpen, onClose }: ReceitaDetalhesModalProps) {
  if (!receita) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-bg border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{receita.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Badges informativos */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="border-neon-green/30 text-neon-green">
              <Clock className="w-3 h-3 mr-1" />
              {receita.tempo} min
            </Badge>
            <Badge variant="outline" className="border-orange-400/30 text-orange-400">
              <Zap className="w-3 h-3 mr-1" />
              {receita.calorias} kcal
            </Badge>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
              {receita.refeicao}
            </Badge>
          </div>

          {/* Ingredientes */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-neon-green" />
              Ingredientes:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {receita.ingredientes.map((ingrediente, index) => (
                <div key={index} className="text-white/80 flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full" />
                  {ingrediente}
                </div>
              ))}
            </div>
          </div>

          {/* Modo de Preparo */}
          <div>
            <h4 className="text-white font-semibold mb-3">Modo de Preparo:</h4>
            <ol className="space-y-3">
              {receita.preparo.map((passo, index) => (
                <li key={index} className="text-white/80 flex gap-4">
                  <span className="text-neon-green font-bold text-lg min-w-[24px]">
                    {index + 1}.
                  </span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tabela Nutricional */}
          <div>
            <h4 className="text-white font-semibold mb-3">Informações Nutricionais:</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-neon-green mb-1">
                  {receita.calorias}
                </div>
                <div className="text-white/60 text-sm">Calorias</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {receita.macros.proteinas}g
                </div>
                <div className="text-white/60 text-sm">Proteínas</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {receita.macros.carboidratos}g
                </div>
                <div className="text-white/60 text-sm">Carboidratos</div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {receita.macros.gorduras}g
                </div>
                <div className="text-white/60 text-sm">Gorduras</div>
              </div>
            </div>
          </div>

          {/* Sugestões Extras */}
          <div>
            <h4 className="text-white font-semibold mb-3">💡 Sugestões Extras:</h4>
            <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4 space-y-2">
              <p className="text-white/80">• Beba bastante água durante o preparo e consumo</p>
              <p className="text-white/80">• Prefira ingredientes orgânicos quando possível</p>
              <p className="text-white/80">• Ajuste o sal e temperos conforme seu gosto</p>
              <p className="text-white/80">• Esta receita pode ser preparada com até 2 dias de antecedência</p>
              {receita.refeicao === "Café da Manhã" && (
                <p className="text-white/80">• Ideal consumir até 30 minutos após o despertar</p>
              )}
              {receita.refeicao === "Almoço" && (
                <p className="text-white/80">• Combine com uma salada verde para mais fibras</p>
              )}
              {receita.refeicao === "Jantar" && (
                <p className="text-white/80">• Evite consumir até 2 horas antes de dormir</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

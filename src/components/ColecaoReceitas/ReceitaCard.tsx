
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Heart, Trash2, Eye } from "lucide-react";
import { Receita } from "@/types/receitas";
import { useState } from "react";
import { ReceitaDetalhesModal } from "@/components/GeradorReceitas/ReceitaDetalhesModal";

interface ReceitaCardProps {
  receita: Receita;
  onToggleFavorito: () => void;
  onRemoverReceita?: () => void;
  showDeleteButton?: boolean;
}

const ReceitaCard = ({ 
  receita, 
  onToggleFavorito, 
  onRemoverReceita, 
  showDeleteButton = false 
}: ReceitaCardProps) => {
  const [showModal, setShowModal] = useState(false);

  // Debug log to see what data we're receiving
  console.log('🔍 ReceitaCard - Rendering recipe:', {
    nome: receita.nome,
    tempo: receita.tempo,
    calorias: receita.calorias,
    macros: receita.macros,
    preparoSteps: receita.preparo?.length || 0
  });

  // Ensure we have valid values with better fallbacks
  const tempo = receita.tempo && receita.tempo > 0 ? receita.tempo : null;
  const calorias = receita.calorias && receita.calorias > 0 ? receita.calorias : null;
  const macros = receita.macros || { proteinas: 0, carboidratos: 0, gorduras: 0 };
  
  // Check if macros are valid (not all zeros)
  const hasMacros = macros.proteinas > 0 || macros.carboidratos > 0 || macros.gorduras > 0;

  return (
    <>
      <Card className="bg-white/5 border-white/10 hover:border-neon-green/30 transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-bold line-clamp-2">
            {receita.nome}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {tempo && (
              <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                <Clock className="w-3 h-3 mr-1" />
                {tempo} min
              </Badge>
            )}
            {calorias && (
              <Badge variant="outline" className="border-orange-400/30 text-orange-400">
                <Zap className="w-3 h-3 mr-1" />
                {calorias} kcal
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Macros Section - only show if we have valid macros */}
          {hasMacros && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 p-2 rounded">
                <div className="text-blue-400 font-bold text-sm">{macros.proteinas}g</div>
                <div className="text-white/60 text-xs">Protein</div>
              </div>
              <div className="bg-white/10 p-2 rounded">
                <div className="text-yellow-400 font-bold text-sm">{macros.carboidratos}g</div>
                <div className="text-white/60 text-xs">Carbs</div>
              </div>
              <div className="bg-white/10 p-2 rounded">
                <div className="text-red-400 font-bold text-sm">{macros.gorduras}g</div>
                <div className="text-white/60 text-xs">Fat</div>
              </div>
            </div>
          )}

          {/* Show message if data is missing */}
          {(!tempo || !calorias || !hasMacros) && (
            <div className="text-yellow-400/70 text-xs text-center bg-yellow-400/10 p-2 rounded">
              Some nutritional data may be missing
            </div>
          )}

          {/* Ingredients preview */}
          <div className="space-y-2">
            <h4 className="text-white/80 font-medium text-sm">Ingredients:</h4>
            <div className="text-white/70 text-sm">
              {receita.ingredientes.slice(0, 3).map((ingrediente, index) => (
                <div key={index} className="truncate">• {ingrediente}</div>
              ))}
              {receita.ingredientes.length > 3 && (
                <div className="text-neon-green text-xs">
                  +{receita.ingredientes.length - 3} more ingredients
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Recipe
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorito}
              className={`${
                receita.favorita 
                  ? "text-red-500 hover:text-red-400" 
                  : "text-white/60 hover:text-red-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${receita.favorita ? "fill-current" : ""}`} />
            </Button>

            {showDeleteButton && onRemoverReceita && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoverReceita}
                className="text-white/60 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ReceitaDetalhesModal
        receita={receita}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ReceitaCard;

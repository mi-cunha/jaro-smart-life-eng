
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Zap, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReceitaDetalhesModal } from "@/components/GeradorReceitas/ReceitaDetalhesModal";

interface Receita {
  id: string;
  nome: string;
  tempo: number;
  calorias: number;
  refeicao: string;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  favorita: boolean;
}

interface ReceitaCardProps {
  receita: Receita;
  onToggleFavorito: () => void;
  onRemoverReceita?: () => void;
  showDeleteButton?: boolean;
}

export default function ReceitaCard({ 
  receita, 
  onToggleFavorito, 
  onRemoverReceita,
  showDeleteButton = false 
}: ReceitaCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Provide default values if macros is undefined
  const macros = receita.macros || {
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0
  };

  return (
    <>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg font-bold leading-tight">{receita.nome}</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorito}
                className="p-1 h-8 w-8"
              >
                <Heart 
                  className={`w-4 h-4 ${receita.favorita ? 'fill-red-500 text-red-500' : 'text-white/60'}`} 
                />
              </Button>
              {showDeleteButton && onRemoverReceita && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoverReceita}
                  className="p-1 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-neon-green/30 text-neon-green">
              <Clock className="w-3 h-3 mr-1" />
              {receita.tempo} min
            </Badge>
            <Badge variant="outline" className="border-orange-400/30 text-orange-400">
              <Zap className="w-3 h-3 mr-1" />
              {receita.calorias} kcal
            </Badge>
          </div>

          {/* Ingredients Preview */}
          <div className="bg-white/5 rounded-lg p-3">
            <h5 className="text-white/90 text-sm font-semibold mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
              Ingredients:
            </h5>
            <div className="space-y-1">
              {receita.ingredientes.slice(0, 3).map((ingrediente, index) => (
                <div key={index} className="text-white/70 text-xs flex items-center gap-2">
                  <div className="w-1 h-1 bg-neon-green/60 rounded-full flex-shrink-0" />
                  {ingrediente}
                </div>
              ))}
              {receita.ingredientes.length > 3 && (
                <div className="text-neon-green text-xs">
                  +{receita.ingredientes.length - 3} more ingredients
                </div>
              )}
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-white/5 rounded border border-white/10">
              <div className="text-white/60">Protein</div>
              <div className="text-white font-medium">{macros.proteinas}g</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded border border-white/10">
              <div className="text-white/60">Carbs</div>
              <div className="text-white font-medium">{macros.carboidratos}g</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded border border-white/10">
              <div className="text-white/60">Fat</div>
              <div className="text-white font-medium">{macros.gorduras}g</div>
            </div>
          </div>

          <Button
            onClick={() => setShowDetails(true)}
            variant="outline"
            size="sm"
            className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Recipe Details
          </Button>
        </CardContent>
      </Card>

      <ReceitaDetalhesModal
        receita={receita}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}

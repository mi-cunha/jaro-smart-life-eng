
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Zap, Eye } from "lucide-react";
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
}

export default function ReceitaCard({ receita, onToggleFavorito }: ReceitaCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg">{receita.nome}</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-neon-green/30 text-neon-green">
              <Clock className="w-3 h-3 mr-1" />
              {receita.tempo}min
            </Badge>
            <Badge variant="outline" className="border-orange-400/30 text-orange-400">
              <Zap className="w-3 h-3 mr-1" />
              {receita.calorias} kcal
            </Badge>
          </div>

          <div>
            <h5 className="text-white/80 text-sm font-medium mb-2">Ingredientes:</h5>
            <div className="flex flex-wrap gap-1">
              {receita.ingredientes.slice(0, 3).map((ingrediente, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/70">
                  {ingrediente}
                </Badge>
              ))}
              {receita.ingredientes.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">
                  +{receita.ingredientes.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white/60">Proteínas</div>
              <div className="text-white font-medium">{receita.macros.proteinas}g</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white/60">Carboidratos</div>
              <div className="text-white font-medium">{receita.macros.carboidratos}g</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white/60">Gorduras</div>
              <div className="text-white font-medium">{receita.macros.gorduras}g</div>
            </div>
          </div>

          <Button
            onClick={() => setShowDetails(true)}
            variant="outline"
            size="sm"
            className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
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

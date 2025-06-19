
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Bot, Loader2 } from "lucide-react";
import { SelecaoIngredientes } from "./SelecaoIngredientes";
import ReceitaCard from "@/components/ColecaoReceitas/ReceitaCard";
import { Receita, Ingrediente } from "@/types/receitas";

interface RefeicaoSectionProps {
  refeicao: string;
  ingredientes: Ingrediente[];
  receitas: Receita[];
  onToggleIngrediente: (index: number) => void;
  onToggleTodos: () => void;
  onToggleFavorito: (receitaId: string) => void;
  onGerarReceitas: () => void;
  onRemoverReceita: (receitaId: string) => void;
  itensComprados?: string[];
  temItensComprados?: boolean;
  loading?: boolean;
}

export function RefeicaoSection({
  refeicao,
  ingredientes,
  receitas,
  onToggleIngrediente,
  onToggleTodos,
  onToggleFavorito,
  onGerarReceitas,
  onRemoverReceita,
  itensComprados = [],
  temItensComprados = false,
  loading = false
}: RefeicaoSectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl">{refeicao}</CardTitle>
        {temItensComprados && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-neon-green" />
              <span className="text-neon-green text-sm font-medium">
                Available Purchased Items:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {itensComprados.map((item, index) => (
                <Badge 
                  key={index} 
                  className="bg-neon-green/20 text-neon-green border-neon-green/30"
                >
                  ✓ {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <SelecaoIngredientes
          refeicao={refeicao}
          ingredientes={ingredientes}
          onToggleIngrediente={onToggleIngrediente}
          onToggleTodos={onToggleTodos}
        />

        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-white/80 font-medium">Your Recipes:</h4>
              <Bot className="w-4 h-4 text-neon-green" />
            </div>
            <Button
              onClick={onGerarReceitas}
              disabled={loading}
              className="bg-neon-green text-black hover:bg-neon-green/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Recipe...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Recipe
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receitas.map((receita) => (
              <ReceitaCard
                key={receita.id}
                receita={receita}
                onToggleFavorito={() => onToggleFavorito(receita.id)}
                onRemoverReceita={() => onRemoverReceita(receita.id)}
                showDeleteButton={true}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

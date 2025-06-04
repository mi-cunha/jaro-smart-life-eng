
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
}

export function RefeicaoSection({
  refeicao,
  ingredientes,
  receitas,
  onToggleIngrediente,
  onToggleTodos,
  onToggleFavorito,
  onGerarReceitas
}: RefeicaoSectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl">{refeicao}</CardTitle>
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
            <h4 className="text-white/80 font-medium">Receitas:</h4>
            <Button
              onClick={onGerarReceitas}
              className="bg-neon-green text-black hover:bg-neon-green/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Mais Receitas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receitas.map((receita) => (
              <ReceitaCard
                key={receita.id}
                receita={receita}
                onToggleFavorito={() => onToggleFavorito(receita.id)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

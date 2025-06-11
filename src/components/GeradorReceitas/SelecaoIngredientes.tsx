
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Ingrediente {
  nome: string;
  selecionado: boolean;
}

interface SelecaoIngredientesProps {
  refeicao: string;
  ingredientes: Ingrediente[];
  onToggleIngrediente: (index: number) => void;
  onToggleTodos: () => void;
}

export function SelecaoIngredientes({
  refeicao,
  ingredientes,
  onToggleIngrediente,
  onToggleTodos
}: SelecaoIngredientesProps) {
  if (!ingredientes || ingredientes.length === 0) {
    return (
      <div className="text-white/60 text-center py-4">
        No ingredients available for {refeicao}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-white/80 font-medium">Available Ingredients:</h4>
        <Button
          onClick={onToggleTodos}
          variant="outline"
          size="sm"
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        >
          Select/Unselect All
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ingredientes.map((ingrediente, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              checked={ingrediente.selecionado}
              onCheckedChange={() => onToggleIngrediente(index)}
              className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
            />
            <label className="text-white/80 text-sm">{ingrediente.nome}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

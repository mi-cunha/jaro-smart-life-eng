
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { SugerirItemModal } from "./SugerirItemModal";
import { useState } from "react";

interface Ingrediente {
  nome: string;
  selecionado: boolean;
}

interface SelecaoIngredientesProps {
  ingredientes: Ingrediente[];
  onToggleIngrediente: (index: number) => void;
  onToggleTodos: () => void;
  onAddIngrediente: (ingrediente: string) => void;
  refeicao: string;
  itensComprados?: string[];
  temItensComprados?: boolean;
}

export function SelecaoIngredientes({ 
  ingredientes, 
  onToggleIngrediente, 
  onToggleTodos, 
  onAddIngrediente,
  refeicao,
  itensComprados = [],
  temItensComprados = false
}: SelecaoIngredientesProps) {
  const [showSugerirModal, setShowSugerirModal] = useState(false);
  
  const todosSelecionados = ingredientes.length > 0 && ingredientes.every(ing => ing.selecionado);
  
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-white">Available Ingredients</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTodos}
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm px-2 py-1"
          >
            {todosSelecionados ? (
              <>
                <X className="w-3 h-3 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <Check className="w-3 h-3 mr-1" />
                Select All
              </>
            )}
          </Button>
        </div>
      </div>

      {temItensComprados && (
        <div className="mb-3 md:mb-4">
          <h4 className="text-sm md:text-base font-medium text-neon-green mb-2">From Shopping List:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {itensComprados.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 bg-neon-green/10 p-2 rounded-lg border border-neon-green/30">
                <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0"></div>
                <span className="text-neon-green text-xs md:text-sm font-medium truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ingredientes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {ingredientes.map((ingrediente, index) => (
            <div
              key={index}
              className={`flex items-center space-x-1 md:space-x-1.5 p-1 md:p-1.5 rounded-lg border transition-all cursor-pointer ${
                ingrediente.selecionado
                  ? 'bg-white/10 border-white/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => onToggleIngrediente(index)}
            >
              <Checkbox
                checked={ingrediente.selecionado}
                className="w-3 h-3 md:w-3.5 md:h-3.5 border-white/30 data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green flex-shrink-0 [&>svg]:w-1.5 [&>svg]:h-1.5 md:[&>svg]:w-2 md:[&>svg]:h-2"
              />
              <span className={`text-xs md:text-sm font-medium flex-1 min-w-0 ${
                ingrediente.selecionado ? 'text-white' : 'text-white/70'
              }`}>
                {ingrediente.nome}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 md:py-8">
          <p className="text-white/60 text-sm md:text-base mb-3 md:mb-4">No ingredients available for {refeicao}</p>
          <Button
            variant="outline"
            onClick={() => setShowSugerirModal(true)}
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Ingredient
          </Button>
        </div>
      )}

      <SugerirItemModal
        refeicoes={[refeicao]}
        onAddIngrediente={(refeicao, ingrediente) => onAddIngrediente(ingrediente)}
      />
    </div>
  );
}

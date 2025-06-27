
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Save, X } from "lucide-react";

interface Item {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  categoria?: string;
  comprado: boolean;
}

interface TabelaItensRefeicaoProps {
  itens: Item[];
  onToggleItem: (id: string) => void;
  onRemoverItem: (id: string) => void;
  onUpdatePreco: (id: string, novoPreco: number) => void;
}

export function TabelaItensRefeicao({ 
  itens, 
  onToggleItem, 
  onRemoverItem, 
  onUpdatePreco 
}: TabelaItensRefeicaoProps) {
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState("");

  const handleEditPreco = (id: string, precoAtual: number) => {
    setEditandoPreco(id);
    setNovoPreco(precoAtual.toString());
  };

  const handleSalvarPreco = (id: string) => {
    const preco = parseFloat(novoPreco);
    if (!isNaN(preco) && preco >= 0) {
      onUpdatePreco(id, preco);
    }
    setEditandoPreco(null);
    setNovoPreco("");
  };

  const handleCancelarEdicao = () => {
    setEditandoPreco(null);
    setNovoPreco("");
  };

  if (itens.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {itens.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
            item.comprado
              ? 'bg-neon-green/10 border-neon-green/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={item.comprado}
              onCheckedChange={() => onToggleItem(item.id)}
              className="w-3 h-3 border-white/30 data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green [&>svg]:w-2 [&>svg]:h-2"
            />
            <div className="flex-1">
              <div className={`font-medium text-sm md:text-base ${
                item.comprado ? 'text-neon-green line-through' : 'text-white'
              }`}>
                {item.nome}
              </div>
              <div className="text-xs md:text-sm text-white/60">
                {item.quantidade} {item.categoria && `• ${item.categoria}`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {editandoPreco === item.id ? (
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  step="0.01"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  className="w-16 h-6 text-xs bg-white/5 border-white/20 text-white p-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSalvarPreco(item.id)}
                  className="h-6 w-6 p-0 bg-neon-green hover:bg-neon-green/80"
                >
                  <Save className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelarEdicao}
                  className="h-6 w-6 p-0 border-white/20 hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditPreco(item.id, item.preco)}
                  className="text-white/70 hover:text-white text-xs p-1 h-6 min-w-12"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  ${item.preco.toFixed(2)}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoverItem(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

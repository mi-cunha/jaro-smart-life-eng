
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit3 } from "lucide-react";
import { useState } from "react";

interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  comprado: boolean;
}

interface TabelaItensRefeicaoProps {
  itens: ItemCompra[];
  onToggleItem: (itemId: string) => void;
  onRemoverItem: (itemId: string) => void;
  onUpdatePreco?: (itemId: string, novoPreco: number) => void;
}

export function TabelaItensRefeicao({ 
  itens, 
  onToggleItem, 
  onRemoverItem, 
  onUpdatePreco 
}: TabelaItensRefeicaoProps) {
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  const handleEditPrice = (itemId: string, currentPrice: number) => {
    setEditingPrice(itemId);
    setTempPrice(currentPrice > 0 ? currentPrice.toString() : "");
  };

  const handleSavePrice = (itemId: string) => {
    const newPrice = parseFloat(tempPrice) || 0;
    if (onUpdatePreco) {
      onUpdatePreco(itemId, newPrice);
    }
    setEditingPrice(null);
    setTempPrice("");
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setTempPrice("");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-white/80 py-3 w-12"></th>
            <th className="text-left text-white/80 py-3">Item</th>
            <th className="text-left text-white/80 py-3">Quantity</th>
            <th className="text-left text-white/80 py-3">Price</th>
            <th className="text-left text-white/80 py-3">Status</th>
            <th className="text-left text-white/80 py-3 w-16">Actions</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-white/5 ${
                item.comprado ? 'bg-neon-green/5' : ''
              }`}
            >
              <td className="py-3">
                <Checkbox
                  checked={item.comprado}
                  onCheckedChange={() => onToggleItem(item.id)}
                  className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                />
              </td>
              <td className={`py-3 ${item.comprado ? 'text-white line-through' : 'text-white'}`}>
                {item.nome}
              </td>
              <td className="text-white/70 py-3">{item.quantidade}</td>
              <td className="py-3">
                {editingPrice === item.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">$</span>
                    <Input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-20 h-8 bg-white/10 border-white/20 text-white text-sm"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePrice(item.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button
                      onClick={() => handleSavePrice(item.id)}
                      size="sm"
                      className="h-6 w-6 p-0 bg-neon-green/20 hover:bg-neon-green/30"
                    >
                      ✓
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white/40 hover:text-white/60"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.preco > 0 ? (
                      <span className="text-neon-green font-medium">
                        ${item.preco.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm italic">
                        Click to set price
                      </span>
                    )}
                    {onUpdatePreco && (
                      <Button
                        onClick={() => handleEditPrice(item.id, item.preco)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/40 hover:text-neon-green"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </td>
              <td className="py-3">
                {item.comprado ? (
                  <span className="text-neon-green text-sm font-medium">✅ Purchased</span>
                ) : (
                  <span className="text-white/40 text-sm">Pending</span>
                )}
              </td>
              <td className="py-3">
                <Button
                  onClick={() => onRemoverItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

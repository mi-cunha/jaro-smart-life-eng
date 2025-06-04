
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
}

export function TabelaItensRefeicao({ itens, onToggleItem, onRemoverItem }: TabelaItensRefeicaoProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-white/80 py-3 w-12"></th>
            <th className="text-left text-white/80 py-3">Item</th>
            <th className="text-left text-white/80 py-3">Quantidade</th>
            <th className="text-left text-white/80 py-3">Preço Estimado</th>
            <th className="text-left text-white/80 py-3">Status</th>
            <th className="text-left text-white/80 py-3 w-16">Ações</th>
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
              <td className="text-neon-green py-3 font-medium">
                R$ {item.preco.toFixed(2)}
              </td>
              <td className="py-3">
                {item.comprado ? (
                  <span className="text-neon-green text-sm font-medium">✅ Comprado</span>
                ) : (
                  <span className="text-white/40 text-sm">Pendente</span>
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


import { Card, CardContent } from "@/components/ui/card";

interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  comprado: boolean;
}

interface EstatisticasRefeicaoProps {
  itens: ItemCompra[];
}

export function EstatisticasRefeicao({ itens }: EstatisticasRefeicaoProps) {
  const itensComprados = itens.filter(item => item.comprado).length;
  const itensPendentes = itens.filter(item => !item.comprado).length;
  const percentualConcluido = itens.length > 0 ? ((itensComprados / itens.length) * 100) : 0;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-neon-green">
            {itensComprados}
          </div>
          <div className="text-sm text-white/70">Itens Comprados</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-neon-green">
            {itensPendentes}
          </div>
          <div className="text-sm text-white/70">Itens Pendentes</div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-neon-green">
            {percentualConcluido.toFixed(0)}%
          </div>
          <div className="text-sm text-white/70">Concluído</div>
        </CardContent>
      </Card>
    </div>
  );
}

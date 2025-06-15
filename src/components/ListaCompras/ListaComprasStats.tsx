
import { Card, CardContent } from "@/components/ui/card";

interface ListaComprasStatsProps {
  totalGeral: number;
  onExportar: () => void;
  onVoltarReceitas: () => void;
}

export function ListaComprasStats({ totalGeral, onExportar, onVoltarReceitas }: ListaComprasStatsProps) {
  return (
    <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neon-green">
              ${totalGeral.toFixed(2)}
            </h2>
            <p className="text-white/70">Estimated shopping total</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExportar}
              className="border border-neon-green/30 text-neon-green hover:bg-neon-green/10 px-4 py-2 rounded-md transition-colors"
            >
              📊 Export List
            </button>
            <button
              onClick={onVoltarReceitas}
              className="bg-neon-green text-black hover:bg-neon-green/90 px-4 py-2 rounded-md transition-colors"
            >
              👨‍🍳 Back to Recipes
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

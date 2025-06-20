
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface ListaComprasStatsProps {
  totalGeral: number;
  onExportar: () => void;
  onVoltarReceitas: () => void;
}

export function ListaComprasStats({ totalGeral, onExportar, onVoltarReceitas }: ListaComprasStatsProps) {
  return (
    <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-neon-green">
              ${totalGeral.toFixed(2)}
            </h2>
            <p className="text-white/70 text-sm md:text-base">Estimated shopping total</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={onExportar}
              className="border border-neon-green/30 text-neon-green hover:bg-neon-green/10 px-3 md:px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4" />
              Export PDF
            </button>
            <button
              onClick={onVoltarReceitas}
              className="bg-neon-green text-black hover:bg-neon-green/90 px-3 md:px-4 py-2 rounded-md transition-colors text-sm md:text-base text-center"
            >
              👨‍🍳 Back to Recipes
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

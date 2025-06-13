
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumoCompraProps {
  refeicoes: string[];
  calcularTotalRefeicao: (refeicao: string) => number;
  calcularTotalGeral: () => number;
  itensPorRefeicao: { [key: string]: any[] };
}

export function ResumoCompra({
  refeicoes,
  calcularTotalRefeicao,
  calcularTotalGeral,
  itensPorRefeicao
}: ResumoCompraProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Purchase Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {refeicoes.map((refeicao) => {
            const itensRefeicao = itensPorRefeicao[refeicao] || [];
            const itensComprados = itensRefeicao.filter(item => item.comprado);
            
            return (
              <div key={refeicao} className="text-center">
                <div className="text-lg font-bold text-neon-green">
                  ${calcularTotalRefeicao(refeicao).toFixed(2)}
                </div>
                <div className="text-sm text-white/70">{refeicao}</div>
                <div className="text-xs text-white/50 mt-1">
                  {itensComprados.length}/{itensRefeicao.length} items
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <div className="text-3xl font-bold text-neon-green mb-2">
            ${calcularTotalGeral().toFixed(2)}
          </div>
          <div className="text-white/70">Complete shopping total estimate</div>
          <div className="text-sm text-white/50 mt-1">
            {Object.values(itensPorRefeicao).flat().filter(item => item.comprado).length}/
            {Object.values(itensPorRefeicao).flat().length} items purchased
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

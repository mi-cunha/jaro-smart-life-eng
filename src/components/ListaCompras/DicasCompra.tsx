
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DicasCompra() {
  return (
    <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          💡 Dicas de Compra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-white/80">• Compre produtos orgânicos quando possível para maximizar os nutrientes</p>
        <p className="text-white/80">• Prefira frutas e vegetais da estação para economizar</p>
        <p className="text-white/80">• Verifique as datas de validade, especialmente dos perecíveis</p>
        <p className="text-white/80">• Considere comprar alguns itens em maior quantidade se houver promoção</p>
      </CardContent>
    </Card>
  );
}

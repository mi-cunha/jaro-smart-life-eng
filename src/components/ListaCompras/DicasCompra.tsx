
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DicasCompra() {
  return (
    <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          💡 Shopping Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-white/80">• Buy organic products when possible to maximize nutrients</p>
        <p className="text-white/80">• Prefer seasonal fruits and vegetables to save money</p>
        <p className="text-white/80">• Check expiration dates, especially on perishables</p>
        <p className="text-white/80">• Consider buying items in larger quantities if there are promotions</p>
      </CardContent>
    </Card>
  );
}

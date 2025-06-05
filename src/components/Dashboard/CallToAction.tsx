
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CallToAction() {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-neon-green/20 to-transparent border-neon-green/30">
      <CardContent className="p-6 text-center">
        <Zap className="w-12 h-12 text-neon-green mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Continue sua jornada!</h3>
        <p className="text-white/70 mb-4">
          Cada passo conta. Mantenha o foco nos seus objetivos e celebrate cada conquista.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/habit-tracker")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            Ver Todos os Hábitos
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Dashboard Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

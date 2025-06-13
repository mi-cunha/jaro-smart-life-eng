
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CallToAction() {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-neon-green/20 via-neon-green/10 to-transparent border-neon-green/30">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-green/20 rounded-full">
              <Sparkles className="w-8 h-8 text-neon-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to boost your health journey?
              </h2>
              <p className="text-white/70">
                Generate personalized recipes based on your preferences and start cooking healthy meals today.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/gerador-receitas')}
            className="bg-neon-green text-black hover:bg-neon-green/90 font-semibold px-6 py-3 flex items-center gap-2"
          >
            Generate Recipe
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, ChefHat, ShoppingCart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate("/cha-jaro")}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 h-auto py-4 flex flex-col items-center gap-2"
          >
            <Coffee className="w-6 h-6" />
            <span className="text-sm">Chá Jaro</span>
          </Button>

          <Button
            onClick={() => navigate("/gerador-receitas")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 h-auto py-4 flex flex-col items-center gap-2"
          >
            <ChefHat className="w-6 h-6" />
            <span className="text-sm">Receitas</span>
          </Button>

          <Button
            onClick={() => navigate("/lista-compras")}
            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 h-auto py-4 flex flex-col items-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-sm">Compras</span>
          </Button>

          <Button
            onClick={() => navigate("/colecao-receitas")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 h-auto py-4 flex flex-col items-center gap-2"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm">Coleção</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

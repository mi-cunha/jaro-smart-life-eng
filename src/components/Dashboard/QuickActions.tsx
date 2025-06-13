
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ShoppingCart, Heart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Generate Recipe",
      description: "Create a personalized recipe",
      icon: ChefHat,
      color: "from-neon-green/20 to-neon-green/5 border-neon-green/30",
      iconColor: "text-neon-green",
      onClick: () => navigate('/gerador-receitas')
    },
    {
      title: "Shopping List",
      description: "Manage your grocery list",
      icon: ShoppingCart,
      color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
      iconColor: "text-blue-400",
      onClick: () => navigate('/lista-compras')
    },
    {
      title: "Recipe Collection",
      description: "Browse saved recipes",
      icon: Heart,
      color: "from-red-500/20 to-red-500/5 border-red-500/30",
      iconColor: "text-red-400",
      onClick: () => navigate('/colecao-receitas')
    },
    {
      title: "Jaro Tea",
      description: "Track your tea intake",
      icon: Calendar,
      color: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
      iconColor: "text-orange-400",
      onClick: () => navigate('/cha-jaro')
    }
  ];

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Card key={index} className={`bg-gradient-to-br ${action.color} cursor-pointer hover:scale-105 transition-transform`}>
              <CardContent className="p-4" onClick={action.onClick}>
                <div className="flex flex-col items-center text-center space-y-3">
                  <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                    <p className="text-xs text-white/60">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

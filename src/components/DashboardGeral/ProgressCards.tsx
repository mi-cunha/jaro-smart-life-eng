
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProgressCardProps {
  cards: {
    title: string;
    icon: React.ReactNode;
    value: string;
    description: string;
    progress: number;
    link: string;
  }[];
}

export function ProgressCards({ cards }: ProgressCardProps) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              {card.icon}
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold text-neon-green">
              {card.value}
            </div>
            <div className="text-white/70 text-sm">
              {card.description}
            </div>
            {card.progress > 0 && (
              <div className="progress-bar h-2">
                <div 
                  className="progress-fill h-full"
                  style={{ width: `${Math.min(100, card.progress)}%` }}
                />
              </div>
            )}
            {card.link !== "#" && (
              <Button 
                onClick={() => navigate(card.link)}
                variant="outline" 
                size="sm" 
                className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                View More
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

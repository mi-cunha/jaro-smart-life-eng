
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleProgressCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}

export function SimpleProgressCard({
  title,
  value,
  icon,
  color
}: SimpleProgressCardProps) {
  const getTextColor = (color: string) => {
    switch (color) {
      case 'bg-neon-green':
        return 'text-neon-green';
      case 'bg-blue-500':
        return 'text-blue-400';
      case 'bg-orange-500':
        return 'text-orange-400';
      case 'bg-purple-500':
        return 'text-purple-400';
      default:
        return 'text-white';
    }
  };

  return (
    <Card className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getTextColor(color)}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

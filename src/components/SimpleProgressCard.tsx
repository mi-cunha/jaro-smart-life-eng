
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
  return (
    <Card className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color === 'bg-neon-green' ? 'text-neon-green' : color === 'bg-blue-500' ? 'text-blue-400' : 'text-purple-400'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

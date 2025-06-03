
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgressCardProps {
  title: string;
  icon: ReactNode;
  progress: number;
  current: number;
  total: number;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  unit?: string;
}

export function ProgressCard({
  title,
  icon,
  progress,
  current,
  total,
  description,
  buttonText,
  onButtonClick,
  unit = ""
}: ProgressCardProps) {
  return (
    <Card className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/80 text-sm">
          {description}: {current}/{total} {unit}
        </div>
        <div className="progress-bar h-2">
          <div 
            className="progress-fill h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs text-white/60">
          {progress.toFixed(0)}%
        </div>
        <Button 
          onClick={onButtonClick}
          className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-medium"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

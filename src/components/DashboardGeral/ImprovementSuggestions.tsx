
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

interface ImprovementSuggestionsProps {
  suggestions: string[];
}
export function ImprovementSuggestions({ suggestions }: ImprovementSuggestionsProps) {
  return (
    <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-neon-green" />
          Personalized Improvement Suggestions
        </CardTitle>
        <div className="text-sm text-white/70">
          Based on your recent performance
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-neon-green text-sm font-bold">{index + 1}</span>
              </div>
              <div className="text-white/80">{suggestion}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

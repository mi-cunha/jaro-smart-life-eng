
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardActions() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        onClick={() => navigate("/")}
        className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
      >
        Back to Home
      </Button>
      <Button
        onClick={() => navigate("/gerador-receitas")}
        variant="outline"
        className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
      >
        Generate New Recipe
      </Button>
      <Button
        onClick={() => navigate("/habit-tracker")}
        variant="outline"
        className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
      >
        View Today's Habits
      </Button>
    </div>
  );
}

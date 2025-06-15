
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

interface TopRecipe {
  nome: string;
  consumos: number;
  calorias: number;
}
interface TopRecipesTableProps {
  recipes: TopRecipe[];
}

export function TopRecipesTable({ recipes }: TopRecipesTableProps) {
  if (recipes.length === 0) return null;
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-neon-green" />
          Top 5 Most Used Recipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/80 py-3">#</th>
                <th className="text-left text-white/80 py-3">Recipe</th>
                <th className="text-left text-white/80 py-3">Usage</th>
                <th className="text-left text-white/80 py-3">Average Calories</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((receita, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-green font-bold">{index + 1}</span>
                    </div>
                  </td>
                  <td className="text-white py-3">{receita.nome}</td>
                  <td className="text-neon-green py-3 font-medium">{receita.consumos}x</td>
                  <td className="text-white/70 py-3">{receita.calorias} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Clock, Trash2, History, ChefHat, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ReceitaDetalhesModal } from "@/components/GeradorReceitas/ReceitaDetalhesModal";

interface FavoriteRecipe {
  id: string;
  nome: string;
  tempo: number;
  calorias: number;
  refeicao: string;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  dataAdicionada: string;
  favorita: boolean;
}

interface GenerationHistory {
  id: string;
  data: string;
  hora: string;
  quantidadeReceitas: number;
  refeicao: string;
  receitas: CompleteRecipe[];
}

interface CompleteRecipe {
  nome: string;
  tempo: number;
  calorias: number;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
}

const RecipeCollection = () => {
  const navigate = useNavigate();
  const [recipeDetails, setRecipeDetails] = useState<FavoriteRecipe | null>(null);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<{ [key: string]: FavoriteRecipe[] }>({
    "Breakfast": [
      {
        id: "fav1",
        nome: "Berry Oatmeal Bowl",
        tempo: 10,
        calorias: 320,
        refeicao: "Breakfast",
        ingredientes: ["Oats", "Banana", "Mixed Berries", "Greek Yogurt", "Honey"],
        preparo: [
          "Mix oats with Greek yogurt",
          "Add sliced banana",
          "Top with mixed berries",
          "Drizzle honey to taste and serve"
        ],
        macros: { proteinas: 15, carboidratos: 45, gorduras: 8 },
        dataAdicionada: "02/15/2024",
        favorita: true
      },
      {
        id: "fav2",
        nome: "Banana Oat Pancakes",
        tempo: 15,
        calorias: 280,
        refeicao: "Breakfast",
        ingredientes: ["Banana", "Oats", "Eggs", "Cinnamon"],
        preparo: [
          "Mash banana with a fork",
          "Mix with oats, eggs and cinnamon",
          "Heat non-stick pan",
          "Pour batter and cook both sides"
        ],
        macros: { proteinas: 12, carboidratos: 35, gorduras: 9 },
        dataAdicionada: "02/12/2024",
        favorita: true
      }
    ],
    "Lunch": [
      {
        id: "fav3",
        nome: "Grilled Chicken with Quinoa and Broccoli",
        tempo: 25,
        calorias: 380,
        refeicao: "Lunch",
        ingredientes: ["Chicken Breast", "Quinoa", "Broccoli", "Olive Oil", "Garlic"],
        preparo: [
          "Season and grill chicken breast",
          "Cook quinoa in salted water",
          "Sauté broccoli with garlic and olive oil",
          "Plate and serve hot"
        ],
        macros: { proteinas: 35, carboidratos: 30, gorduras: 10 },
        dataAdicionada: "02/14/2024",
        favorita: true
      }
    ],
    "Snack": [
      {
        id: "fav4",
        nome: "Mixed Nuts with Yogurt",
        tempo: 5,
        calorias: 200,
        refeicao: "Snack",
        ingredientes: ["Greek Yogurt", "Cashews", "Almonds", "Walnuts"],
        preparo: [
          "Place yogurt in a bowl",
          "Add mixed nuts",
          "Mix gently",
          "Consume immediately"
        ],
        macros: { proteinas: 12, carboidratos: 18, gorduras: 12 },
        dataAdicionada: "02/13/2024",
        favorita: true
      }
    ],
    "Dinner": []
  });

  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([
    {
      id: "hist1",
      data: "02/15/2024",
      hora: "7:30 PM",
      quantidadeReceitas: 3,
      refeicao: "Dinner",
      receitas: [
        {
          nome: "Grilled Tofu with Vegetables",
          tempo: 20,
          calorias: 250,
          ingredientes: ["Tofu", "Zucchini", "Mushrooms", "Olive Oil"],
          preparo: ["Cut tofu", "Grill until golden", "Sauté vegetables", "Serve hot"],
          macros: { proteinas: 18, carboidratos: 12, gorduras: 14 }
        },
        {
          nome: "Salmon with Asparagus",
          tempo: 25,
          calorias: 320,
          ingredientes: ["Salmon", "Asparagus", "Lemon", "Herbs"],
          preparo: ["Season salmon", "Bake in oven", "Steam asparagus", "Finish with lemon"],
          macros: { proteinas: 28, carboidratos: 8, gorduras: 18 }
        }
      ]
    },
    {
      id: "hist2",
      data: "02/14/2024",
      hora: "12:15 PM",
      quantidadeReceitas: 2,
      refeicao: "Lunch",
      receitas: [
        {
          nome: "Chicken with Sweet Potato",
          tempo: 30,
          calorias: 380,
          ingredientes: ["Chicken", "Sweet Potato", "Broccoli"],
          preparo: ["Grill chicken", "Bake sweet potato", "Sauté broccoli", "Plate dish"],
          macros: { proteinas: 35, carboidratos: 30, gorduras: 10 }
        }
      ]
    }
  ]);

  const removeFavorite = (meal: string, recipeId: string) => {
    setFavoriteRecipes(prev => ({
      ...prev,
      [meal]: prev[meal].filter(recipe => recipe.id !== recipeId)
    }));
    toast.success("Recipe removed from favorites");
  };

  const clearHistory = () => {
    setGenerationHistory([]);
    toast.success("History cleared successfully!");
  };

  const totalFavorites = Object.values(favoriteRecipes).flat().length;
  const meals = ["Breakfast", "Lunch", "Snack", "Dinner"];

  return (
    <Layout title="Recipe Collection" breadcrumb={["Home", "Recipe Collection"]}>
      <div className="space-y-8">
        {/* General Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {totalFavorites}
              </div>
              <div className="text-white/70">Favorite Recipes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {generationHistory.length}
              </div>
              <div className="text-white/70">Generation Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {generationHistory.reduce((total, item) => total + item.quantidadeReceitas, 0)}
              </div>
              <div className="text-white/70">Total Generated Recipes</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-white/10">
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({totalFavorites})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white"
            >
              <History className="w-4 h-4 mr-2" />
              Generation History
            </TabsTrigger>
          </TabsList>

          {/* Favorites Section */}
          <TabsContent value="favorites" className="space-y-6">
            {totalFavorites === 0 ? (
              <Card className="bg-dark-bg border-white/10">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No favorite recipes yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Start favoriting recipes in the Recipe Generator to see them here!
                  </p>
                  <Button
                    onClick={() => navigate("/gerador-receitas")}
                    className="bg-neon-green text-black hover:bg-neon-green/90"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Go to Recipe Generator
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {meals.map((meal) => (
                  <AccordionItem
                    key={meal}
                    value={meal}
                    className="bg-dark-bg border border-white/10 rounded-lg"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{meal}</span>
                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                          {favoriteRecipes[meal].length} recipes
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {favoriteRecipes[meal].length === 0 ? (
                        <p className="text-white/60 text-center py-8">
                          No favorite recipes for {meal.toLowerCase()}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {favoriteRecipes[meal].map((recipe) => (
                            <Card key={recipe.id} className="bg-white/5 border-white/10">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-white text-lg">{recipe.nome}</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFavorite(meal, recipe.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {recipe.tempo} min
                                  </Badge>
                                  <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                    {recipe.calorias} kcal
                                  </Badge>
                                </div>
                                <div className="text-xs text-white/50">
                                  Favorited on {recipe.dataAdicionada}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <h5 className="text-white/80 text-sm font-medium mb-1">Macros:</h5>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.proteinas}g</div>
                                      <div className="text-white/60">Protein</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.carboidratos}g</div>
                                      <div className="text-white/60">Carbs</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.gorduras}g</div>
                                      <div className="text-white/60">Fat</div>
                                    </div>
                                  </div>
                                </div>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                                    >
                                      View Full Recipe
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-dark-bg border-white/10 max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">{recipe.nome}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="flex gap-4">
                                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {recipe.tempo} min
                                        </Badge>
                                        <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                                          {recipe.calorias} kcal
                                        </Badge>
                                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                                          {recipe.refeicao}
                                        </Badge>
                                      </div>

                                      <div>
                                        <h4 className="text-white font-medium mb-2">Ingredients:</h4>
                                        <ul className="space-y-1">
                                          {recipe.ingredientes.map((ingredient, index) => (
                                            <li key={index} className="text-white/80 flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                              {ingredient}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <h4 className="text-white font-medium mb-2">Instructions:</h4>
                                        <ol className="space-y-2">
                                          {recipe.preparo.map((step, index) => (
                                            <li key={index} className="text-white/80 flex gap-3">
                                              <span className="text-neon-green font-bold">{index + 1}.</span>
                                              {step}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* History Section */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Generation History</CardTitle>
                  {generationHistory.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-dark-bg border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-white/80">
                            Are you sure you want to delete all generation history? This action cannot be undone.
                          </p>
                          <div className="flex gap-4">
                            <Button
                              onClick={clearHistory}
                              className="bg-red-600 text-white hover:bg-red-700 flex-1"
                            >
                              Yes, clear history
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Cancel
                              </Button>
                            </DialogTrigger>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No history found
                    </h3>
                    <p className="text-white/60">
                      Generation history was cleared or you haven't generated recipes yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generationHistory.map((item) => (
                      <Card key={item.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-white font-medium">
                                {item.data} at {item.hora}
                              </div>
                              <div className="text-sm text-white/60">
                                {item.quantidadeReceitas} recipes generated for {item.refeicao}
                              </div>
                            </div>
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              {item.refeicao}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {item.receitas.map((recipe, index) => (
                              <Card key={index} className="bg-white/5 border-white/10">
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-white text-sm font-medium">{recipe.nome}</h5>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setRecipeDetails({
                                        ...recipe,
                                        id: `hist-${index}`,
                                        refeicao: item.refeicao,
                                        dataAdicionada: item.data,
                                        favorita: false
                                      })}
                                      className="p-1 h-6 w-6"
                                    >
                                      <Eye className="w-3 h-3 text-neon-green" />
                                    </Button>
                                  </div>
                                  <div className="flex gap-2 mb-2">
                                    <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs">
                                      <Clock className="w-2 h-2 mr-1" />
                                      {recipe.tempo}min
                                    </Badge>
                                    <Badge variant="outline" className="border-orange-400/30 text-orange-400 text-xs">
                                      {recipe.calorias} kcal
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 text-xs">
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.proteinas}g</div>
                                      <div className="text-white/60">Protein</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.carboidratos}g</div>
                                      <div className="text-white/60">Carbs</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-neon-green font-bold">{recipe.macros.gorduras}g</div>
                                      <div className="text-white/60">Fat</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/gerador-receitas")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Generate New Recipes
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Back to Home
          </Button>
        </div>
      </div>

      <ReceitaDetalhesModal
        receita={recipeDetails}
        isOpen={!!recipeDetails}
        onClose={() => setRecipeDetails(null)}
      />
    </Layout>
  );
};

export default RecipeCollection;

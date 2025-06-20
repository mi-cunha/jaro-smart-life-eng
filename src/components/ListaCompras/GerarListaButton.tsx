
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSupabaseReceitas } from "@/hooks/useSupabaseReceitas";
import { supabase } from "@/integrations/supabase/client";

interface GerarListaButtonProps {
  onAddItens: (itens: any[]) => void;
}

export function GerarListaButton({ onAddItens }: GerarListaButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { receitas } = useSupabaseReceitas();

  const gerarLista = async () => {
    setIsGenerating(true);
    
    const loadingToast = toast.loading("Generating shopping list from your favorite recipes...", { 
      duration: 5000
    });
    
    try {
      // Get all favorite recipes from all meals
      const receitasFavoritas = Object.values(receitas)
        .flat()
        .filter(receita => receita.favorita);
      
      if (receitasFavoritas.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No favorite recipes found. Please mark some recipes as favorites first!");
        setIsGenerating(false);
        return;
      }

      console.log('📋 Generating list from favorite recipes:', {
        favoritesCount: receitasFavoritas.length
      });

      // Call the edge function to optimize the ingredients
      const { data, error } = await supabase.functions.invoke('optimize-shopping-list', {
        body: {
          receitas: receitasFavoritas.map(receita => ({
            nome: receita.nome,
            ingredientes: receita.ingredientes || []
          }))
        }
      });

      if (error) {
        console.error('🚨 Error calling optimization function:', error);
        throw error;
      }

      const { optimizedItems } = data;

      if (!optimizedItems || optimizedItems.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No ingredients found in favorite recipes.");
        setIsGenerating(false);
        return;
      }

      // Add items directly to the list
      onAddItens(optimizedItems);
      
      toast.dismiss(loadingToast);
      toast.success(`Shopping list generated!`, {
        description: `Added ${optimizedItems.length} items from ${receitasFavoritas.length} favorite recipes`
      });

    } catch (error) {
      console.error('🚨 Error generating list:', error);
      toast.dismiss(loadingToast);
      toast.error("Error generating list", {
        description: "Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={gerarLista}
      disabled={isGenerating}
      className="bg-neon-green text-black hover:bg-neon-green/90"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Generate Shopping List
        </>
      )}
    </Button>
  );
}

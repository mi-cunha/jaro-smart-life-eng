
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ItemSugerido {
  nome: string;
  quantidade: string;
  preco: number;
  categoria: string;
  selecionado: boolean;
}

interface GerarListaModalProps {
  refeicao: string;
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  onAddItens: (itens: ItemSugerido[]) => void;
}

export function GerarListaModal({ 
  refeicao, 
  preferenciasAlimentares, 
  restricoesAlimentares, 
  onAddItens 
}: GerarListaModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [itensSugeridos, setItensSugeridos] = useState<ItemSugerido[]>([]);
  const [showResults, setShowResults] = useState(false);

  const gerarLista = async () => {
    setIsGenerating(true);
    toast.loading("Gerando lista personalizada...", { duration: 3000 });
    
    setTimeout(() => {
      // Simulação de geração baseada na refeição e preferências
      const itensBase = {
        "Café da Manhã": [
          { nome: "Aveia em Flocos Integrais", quantidade: "500g", preco: 6.50, categoria: "cereais" },
          { nome: "Bananas Orgânicas", quantidade: "1kg", preco: 5.20, categoria: "frutas" },
          { nome: "Iogurte Natural Desnatado", quantidade: "500ml", preco: 7.80, categoria: "laticínios" },
          { nome: "Mel Orgânico", quantidade: "250ml", preco: 18.90, categoria: "adoçantes" },
          { nome: "Sementes de Chia", quantidade: "200g", preco: 15.60, categoria: "sementes" },
          { nome: "Mirtilos Frescos", quantidade: "200g", preco: 12.90, categoria: "frutas" },
          { nome: "Leite de Amêndoas", quantidade: "1L", preco: 8.90, categoria: "bebidas" }
        ],
        "Almoço": [
          { nome: "Peito de Frango Orgânico", quantidade: "1kg", preco: 18.90, categoria: "proteínas" },
          { nome: "Quinoa Tricolor", quantidade: "500g", preco: 14.80, categoria: "grãos" },
          { nome: "Brócolis Fresco", quantidade: "500g", preco: 6.20, categoria: "vegetais" },
          { nome: "Batata Doce", quantidade: "1kg", preco: 7.50, categoria: "carboidratos" },
          { nome: "Azeite Extra Virgem", quantidade: "500ml", preco: 22.90, categoria: "óleos" },
          { nome: "Tomates Cereja", quantidade: "300g", preco: 5.80, categoria: "vegetais" },
          { nome: "Água de Coco Natural", quantidade: "1L", preco: 4.50, categoria: "bebidas" }
        ],
        "Lanche": [
          { nome: "Mix de Castanhas", quantidade: "200g", preco: 24.90, categoria: "oleaginosas" },
          { nome: "Maçãs Verdes", quantidade: "1kg", preco: 8.90, categoria: "frutas" },
          { nome: "Queijo Cottage", quantidade: "200g", preco: 9.80, categoria: "laticínios" },
          { nome: "Chá Verde", quantidade: "20 sachês", preco: 12.50, categoria: "bebidas" },
          { nome: "Biscoitos Integrais", quantidade: "200g", preco: 6.90, categoria: "snacks" }
        ],
        "Jantar": [
          { nome: "Salmão Fresco", quantidade: "500g", preco: 34.90, categoria: "proteínas" },
          { nome: "Aspargos Frescos", quantidade: "300g", preco: 15.80, categoria: "vegetais" },
          { nome: "Abobrinha", quantidade: "500g", preco: 4.20, categoria: "vegetais" },
          { nome: "Cogumelos Shiitake", quantidade: "200g", preco: 12.90, categoria: "vegetais" },
          { nome: "Limão Siciliano", quantidade: "500g", preco: 3.80, categoria: "frutas" },
          { nome: "Ervas Finas", quantidade: "1 maço", preco: 2.90, categoria: "temperos" },
          { nome: "Água Mineral", quantidade: "1.5L", preco: 2.50, categoria: "bebidas" }
        ]
      };

      let itens = itensBase[refeicao as keyof typeof itensBase] || [];
      
      // Ajustar baseado nas preferências
      if (preferenciasAlimentares === "vegano") {
        itens = itens.filter(item => !["laticínios", "proteínas"].includes(item.categoria) || 
          item.nome.includes("Vegetal") || item.nome.includes("Tofu"));
      }

      // Filtrar restrições
      restricoesAlimentares.forEach(restricao => {
        if (restricao.toLowerCase().includes("lactose")) {
          itens = itens.filter(item => item.categoria !== "laticínios");
        }
        if (restricao.toLowerCase().includes("glúten")) {
          itens = itens.filter(item => !item.nome.toLowerCase().includes("aveia") && 
            !item.nome.toLowerCase().includes("biscoito"));
        }
      });

      const itensSelecionados = itens.slice(0, 7).map(item => ({
        ...item,
        selecionado: true
      }));

      setItensSugeridos(itensSelecionados);
      setShowResults(true);
      setIsGenerating(false);
      toast.success("Lista gerada com sucesso!");
    }, 3000);
  };

  const toggleItem = (index: number) => {
    setItensSugeridos(prev => prev.map((item, i) => 
      i === index ? { ...item, selecionado: !item.selecionado } : item
    ));
  };

  const adicionarItens = () => {
    const itensSelecionados = itensSugeridos.filter(item => item.selecionado);
    if (itensSelecionados.length === 0) {
      toast.error("Selecione pelo menos um item!");
      return;
    }
    
    onAddItens(itensSelecionados);
    toast.success(`${itensSelecionados.length} itens adicionados à lista de ${refeicao}!`);
    setShowResults(false);
    setItensSugeridos([]);
  };

  const resetModal = () => {
    setShowResults(false);
    setItensSugeridos([]);
    setIsGenerating(false);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Gerar Lista
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Gerar Lista para {refeicao}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!showResults && !isGenerating && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Configurações:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-white/60">Refeição:</span>
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                      {refeicao}
                    </Badge>
                  </div>
                  {preferenciasAlimentares && (
                    <div className="flex gap-2">
                      <span className="text-white/60">Preferência:</span>
                      <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                        {preferenciasAlimentares}
                      </Badge>
                    </div>
                  )}
                  {restricoesAlimentares.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-white/60">Restrições:</span>
                      {restricoesAlimentares.map((restricao, index) => (
                        <Badge key={index} variant="outline" className="border-orange-400/30 text-orange-400">
                          {restricao}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={gerarLista}
                className="w-full bg-neon-green text-black hover:bg-neon-green/90"
              >
                Gerar Lista Personalizada
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
              <p className="text-white/80">Gerando lista personalizada baseada em suas preferências...</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">
                Itens Sugeridos ({itensSugeridos.filter(item => item.selecionado).length}/{itensSugeridos.length}):
              </h4>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {itensSugeridos.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Checkbox
                      checked={item.selecionado}
                      onCheckedChange={() => toggleItem(index)}
                      className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.nome}</div>
                      <div className="text-white/60 text-sm">{item.quantidade}</div>
                    </div>
                    <Badge variant="outline" className="border-neon-green/30 text-neon-green text-xs">
                      {item.categoria}
                    </Badge>
                    <div className="text-neon-green font-medium">
                      R$ {item.preco.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={adicionarItens}
                  className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
                >
                  Adicionar Itens Selecionados
                </Button>
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  Gerar Nova Lista
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

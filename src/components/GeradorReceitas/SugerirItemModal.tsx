
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SugerirItemModalProps {
  refeicoes: string[];
  onAddIngrediente?: (refeicao: string, ingrediente: string) => void;
}

interface AvaliacaoItem {
  recomendado: boolean;
  pros?: string[];
  contras?: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    calorias: number;
  };
}

export function SugerirItemModal({ refeicoes, onAddIngrediente }: SugerirItemModalProps) {
  const [novoItem, setNovoItem] = useState({ nome: "", refeicao: "" });
  const [avaliacao, setAvaliacao] = useState<AvaliacaoItem | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const avaliarItem = async () => {
    if (!novoItem.nome || !novoItem.refeicao) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setIsEvaluating(true);
    toast.loading("Avaliando item...", { duration: 2000 });
    
    setTimeout(() => {
      const adequado = Math.random() > 0.3;
      
      const novaAvaliacao: AvaliacaoItem = {
        recomendado: adequado,
        pros: adequado ? [
          "Rico em nutrientes essenciais",
          "Baixo índice glicêmico",
          "Fonte de fibras",
          "Contribui para saciedade",
          "Auxilia no processo de emagrecimento"
        ] : undefined,
        contras: !adequado ? [
          "Alto teor calórico",
          "Rico em açúcares simples",
          "Pode causar picos de insulina",
          "Baixo valor nutricional",
          "Não adequado para emagrecimento"
        ] : undefined,
        macros: {
          proteinas: Math.floor(Math.random() * 20) + 5,
          carboidratos: Math.floor(Math.random() * 30) + 10,
          gorduras: Math.floor(Math.random() * 15) + 2,
          calorias: Math.floor(Math.random() * 200) + 100
        }
      };

      setAvaliacao(novaAvaliacao);
      setIsEvaluating(false);
      
      if (adequado) {
        toast.success(`✔ '${novoItem.nome}' é recomendado para ${novoItem.refeicao}!`);
      } else {
        toast.error(`✖ '${novoItem.nome}' não é recomendado para emagrecimento.`);
      }
    }, 2000);
  };

  const adicionarItem = () => {
    if (onAddIngrediente && avaliacao?.recomendado) {
      onAddIngrediente(novoItem.refeicao, novoItem.nome);
      toast.success(`'${novoItem.nome}' adicionado à lista de ${novoItem.refeicao}!`);
      resetForm();
    }
  };

  const resetForm = () => {
    setNovoItem({ nome: "", refeicao: "" });
    setAvaliacao(null);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>
        <Button className="bg-neon-green text-black hover:bg-neon-green/90 flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Sugerir Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Sugerir Novo Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Nome do Item</label>
              <Input
                value={novoItem.nome}
                onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Quinoa Preta"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-2 block">Refeição</label>
              <Select value={novoItem.refeicao} onValueChange={(value) => setNovoItem(prev => ({ ...prev, refeicao: value }))}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Selecione a refeição..." />
                </SelectTrigger>
                <SelectContent className="bg-dark-bg border-white/20">
                  {refeicoes.map((refeicao) => (
                    <SelectItem key={refeicao} value={refeicao}>{refeicao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!avaliacao && (
            <Button 
              onClick={avaliarItem}
              disabled={isEvaluating}
              className="w-full bg-neon-green text-black hover:bg-neon-green/90"
            >
              {isEvaluating ? "Avaliando..." : "Avaliar Item"}
            </Button>
          )}

          {avaliacao && (
            <Card className={`${avaliacao.recomendado ? 'border-green-500/30' : 'border-red-500/30'} bg-white/5`}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  {avaliacao.recomendado ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${avaliacao.recomendado ? 'text-green-500' : 'text-red-500'}`}>
                    {avaliacao.recomendado ? 'Item Recomendado' : 'Item Não Recomendado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      {avaliacao.recomendado ? 'Prós:' : 'Contras:'}
                    </h4>
                    <ul className="space-y-1">
                      {(avaliacao.pros || avaliacao.contras)?.map((item, index) => (
                        <li key={index} className="text-white/80 text-sm flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${avaliacao.recomendado ? 'bg-green-500' : 'bg-red-500'}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Informações Nutricionais:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white/60">Calorias</div>
                        <div className="text-white font-medium">{avaliacao.macros.calorias}</div>
                      </div>
                      <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white/60">Proteínas</div>
                        <div className="text-white font-medium">{avaliacao.macros.proteinas}g</div>
                      </div>
                      <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white/60">Carboidratos</div>
                        <div className="text-white font-medium">{avaliacao.macros.carboidratos}g</div>
                      </div>
                      <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-white/60">Gorduras</div>
                        <div className="text-white font-medium">{avaliacao.macros.gorduras}g</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {avaliacao.recomendado && (
                    <Button 
                      onClick={adicionarItem}
                      className="bg-green-600 text-white hover:bg-green-700 flex-1"
                    >
                      Adicionar à Lista
                    </Button>
                  )}
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className={`${avaliacao.recomendado ? 'flex-1' : 'w-full'} border-white/20 text-white`}
                  >
                    {avaliacao.recomendado ? 'Avaliar Outro Item' : 'Tentar Outro Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

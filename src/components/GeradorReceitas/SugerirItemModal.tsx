
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SugerirItemModalProps {
  refeicoes: string[];
}

export function SugerirItemModal({ refeicoes }: SugerirItemModalProps) {
  const [novoItem, setNovoItem] = useState({ nome: "", refeicao: "" });

  const avaliarItem = async () => {
    if (!novoItem.nome || !novoItem.refeicao) {
      toast.error("Preencha todos os campos!");
      return;
    }

    toast.loading("Avaliando item...", { duration: 2000 });
    
    setTimeout(() => {
      const adequado = Math.random() > 0.3;
      
      if (adequado) {
        toast.success(`✔ Sim, '${novoItem.nome}' é recomendado para ${novoItem.refeicao}.`);
      } else {
        toast.error(`✖ Não recomendamos '${novoItem.nome}'. Use 'Quinoa' em vez disso.`);
      }
      
      setNovoItem({ nome: "", refeicao: "" });
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-neon-green text-black hover:bg-neon-green/90 flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Sugerir Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Sugerir Novo Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
          <Button 
            onClick={avaliarItem}
            className="w-full bg-neon-green text-black hover:bg-neon-green/90"
          >
            Avaliar Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

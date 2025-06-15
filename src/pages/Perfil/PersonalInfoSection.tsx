
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface PersonalInfoSectionProps {
  nome: string;
  email?: string | null;
  onNomeChange: (nome: string) => void;
  onAlterarSenha?: () => void;
}

export function PersonalInfoSection({
  nome,
  email,
  onNomeChange,
  onAlterarSenha,
}: PersonalInfoSectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-neon-green" />
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white/80">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => onNomeChange(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">E-mail</Label>
            <Input
              id="email"
              value={email || ''}
              disabled
              className="bg-white/5 border-white/20 text-white/60"
            />
            <p className="text-xs text-white/50">O e-mail não pode ser alterado</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          onClick={onAlterarSenha}
        >
          Alterar Senha
        </Button>
      </CardContent>
    </Card>
  );
}

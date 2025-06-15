
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ObjectivesSectionProps {
  perfil: any;
  onChangeObjetivo: (objetivo: string, valor: string) => void;
}

export function ObjectivesSection({ perfil, onChangeObjetivo }: ObjectivesSectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Objetivos & Metas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pesoObjetivo" className="text-white/80">Peso Objetivo (kg)</Label>
            <Input
              id="pesoObjetivo"
              type="number"
              value={perfil.peso_objetivo || ''}
              onChange={(e) => onChangeObjetivo('peso_objetivo', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="habitosDiarios" className="text-white/80">Meta de Hábitos Diários</Label>
            <Input
              id="habitosDiarios"
              type="number"
              value={perfil.habitos_diarios}
              onChange={(e) => onChangeObjetivo('habitos_diarios', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosesCha" className="text-white/80">Meta de Doses do Chá (por dia)</Label>
            <Input
              id="dosesCha"
              type="number"
              value={perfil.doses_cha}
              onChange={(e) => onChangeObjetivo('doses_cha', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caloriasDiarias" className="text-white/80">Meta de Calorias Diárias</Label>
            <Input
              id="caloriasDiarias"
              type="number"
              value={perfil.calorias_diarias}
              onChange={(e) => onChangeObjetivo('calorias_diarias', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

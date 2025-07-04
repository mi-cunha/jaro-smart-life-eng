
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

interface PersonalInfoSectionProps {
  nome: string;
  email?: string | null;
  perfil?: any;
  onNomeChange: (nome: string) => void;
  onActivityLevelChange: (level: string) => void;
}

export function PersonalInfoSection({
  nome,
  email,
  perfil,
  onNomeChange,
  onActivityLevelChange,
}: PersonalInfoSectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-neon-green" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white/80">Name</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => onNomeChange(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              value={email || ''}
              disabled
              className="bg-white/5 border-white/20 text-white/60"
            />
            <p className="text-xs text-white/50">Email cannot be changed</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="activityLevel" className="text-white/80">Activity Level</Label>
          <Select 
            value={perfil?.daily_routine || 'moderate'} 
            onValueChange={onActivityLevelChange}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select your activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary - Little or no exercise</SelectItem>
              <SelectItem value="light">Light - Exercise 1-3 times/week</SelectItem>
              <SelectItem value="moderate">Moderate - Exercise 3-5 times/week</SelectItem>
              <SelectItem value="intense">Intense - Exercise 6-7 times/week</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50">This affects your daily calorie calculation</p>
        </div>
      </CardContent>
    </Card>
  );
}

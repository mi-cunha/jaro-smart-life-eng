
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationsSectionProps {
  perfil: any;
  onToggleNotificacao: (notificacao: string) => void;
}

export function NotificationsSection({ perfil, onToggleNotificacao }: NotificationsSectionProps) {
  const notificacoes = [
    { key: 'notif_tomar_cha', label: 'Lembrete para tomar Chá Jaro', desc: 'Antes das principais refeições' },
    { key: 'notif_marcar_habito', label: 'Lembrete para marcar hábitos', desc: 'Diariamente às 20:00' },
    { key: 'notif_gerar_receitas', label: 'Sugestão para gerar receitas', desc: 'Domingos às 10:00' },
    { key: 'notif_comprar_itens', label: 'Lembrete para comprar itens', desc: 'Quando lista estiver vazia' },
    { key: 'notif_atingir_meta', label: 'Notificação ao atingir meta de peso', desc: 'Quando objetivos forem alcançados' },
  ];
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-neon-green" />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificacoes.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{label}</div>
              <div className="text-white/60 text-sm">{desc}</div>
            </div>
            <Switch
              checked={perfil[key] as boolean}
              onCheckedChange={() => onToggleNotificacao(key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

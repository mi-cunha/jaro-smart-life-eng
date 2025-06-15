
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationsSectionProps {
  perfil: any;
  onToggleNotificacao: (notificacao: string) => void;
}

export function NotificationsSection({ perfil, onToggleNotificacao }: NotificationsSectionProps) {
  const notificacoes = [
    { key: 'notif_tomar_cha', label: 'Jaro Tea Reminder', desc: 'Before main meals' },
    { key: 'notif_marcar_habito', label: 'Habit Tracking Reminder', desc: 'Daily at 8:00 PM' },
    { key: 'notif_gerar_receitas', label: 'Recipe Generation Suggestion', desc: 'Sundays at 10:00 AM' },
    { key: 'notif_comprar_itens', label: 'Shopping List Reminder', desc: 'When list is empty' },
    { key: 'notif_atingir_meta', label: 'Weight Goal Achievement', desc: 'When goals are reached' },
  ];
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-neon-green" />
          Notifications
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

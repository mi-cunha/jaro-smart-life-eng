
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function SaveConfigBar({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-6 z-10">
      <Button
        onClick={onClick}
        className="w-full bg-neon-green text-black hover:bg-neon-green/90 text-lg py-6"
      >
        <Save className="w-5 h-5 mr-2" />
        Configurações Salvas Automaticamente
      </Button>
    </div>
  );
}

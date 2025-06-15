
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

interface AvatarSectionProps {
  nome: string;
  avatar_url?: string | null;
  onAvatarChange: (file: File) => void;
}

export function AvatarSection({ nome, avatar_url, onAvatarChange }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatar_url || undefined} />
          <AvatarFallback className="bg-neon-green/20 text-neon-green text-2xl">
            {nome.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          onClick={handleCameraClick}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon-green text-black hover:bg-neon-green/90"
        >
          <Camera className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">Foto do perfil</h3>
        <p className="text-white/60 text-sm">Clique no ícone da câmera para alterar sua foto</p>
      </div>
    </div>
  );
}

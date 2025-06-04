
import { useState } from 'react';

interface EnhancedLogoProps {
  src?: string;
  alt: string;
  className?: string;
  showText?: boolean;
}

export function EnhancedLogo({ src, alt, className, showText = false }: EnhancedLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Se não tiver imagem ou houver erro, mostra o logo customizado
  if (!src || imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg border-2 border-green-400/30`}>
        <div className="flex items-center space-x-2">
          {/* Ícone do logo */}
          <div className="relative">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-inner">
              <div className="text-green-600 font-bold text-lg">J</div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-sm"></div>
          </div>
          
          {/* Texto do logo (se habilitado) */}
          {showText && (
            <div className="text-white font-semibold text-sm">
              <div className="leading-tight">Jaro</div>
              <div className="text-xs text-green-100">Smart</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-xl`}>
      <img 
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{
          filter: 'contrast(1.1) brightness(1.05) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
        }}
        onError={() => setImageError(true)}
      />
      {/* Overlay sutil para melhorar o contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl"></div>
    </div>
  );
}

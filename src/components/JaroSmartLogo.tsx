
import { Leaf, Sparkles } from 'lucide-react';

interface JaroSmartLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20'
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
};

export function JaroSmartLogo({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  animated = false 
}: JaroSmartLogoProps) {
  
  const logoIcon = (
    <div className={`relative ${iconSizes[size]} bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg border-2 border-green-400/30 flex items-center justify-center ${animated ? 'animate-pulse' : ''}`}>
      {/* Letra J estilizada */}
      <div className="relative">
        <span className="text-white font-bold text-lg leading-none">J</span>
        <Leaf className="absolute -top-1 -right-2 w-3 h-3 text-green-300" />
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full"></div>
      
      {/* Partículas decorativas */}
      {animated && (
        <>
          <Sparkles className="absolute -top-2 -left-2 w-3 h-3 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute -bottom-1 -right-1 w-2 h-2 text-green-300 animate-bounce" style={{ animationDelay: '1s' }} />
        </>
      )}
    </div>
  );

  const logoText = (
    <div className="flex flex-col">
      <span className="text-neon-green font-bold text-xl leading-tight">Jaro</span>
      <span className="text-green-400 text-sm font-medium -mt-1">Smart</span>
    </div>
  );

  if (variant === 'icon') {
    return <div className={className}>{logoIcon}</div>;
  }

  if (variant === 'text') {
    return <div className={className}>{logoText}</div>;
  }

  return (
    <div className={`flex items-center space-x-3 ${sizeClasses[size]} ${className}`}>
      {logoIcon}
      {logoText}
    </div>
  );
}

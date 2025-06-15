
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

export function JaroSmartLogo({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  animated = false 
}: JaroSmartLogoProps) {
  
  const logoImage = (
    <img
      src="/lovable-uploads/fb86ead1-9af2-414a-b7f1-ab107a0a0a68.png"
      alt="JaroSmart Logo"
      className={`${sizeClasses[size]} w-auto object-contain ${animated ? 'animate-pulse' : ''} ${className}`}
    />
  );

  // For icon variant, show just a square portion of the logo
  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} aspect-square overflow-hidden rounded-lg ${className}`}>
        <img
          src="/lovable-uploads/fb86ead1-9af2-414a-b7f1-ab107a0a0a68.png"
          alt="JaroSmart Logo"
          className={`h-full w-full object-cover ${animated ? 'animate-pulse' : ''}`}
        />
      </div>
    );
  }

  // For text variant, extract just the text portion (this would need the logo split)
  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-neon-green font-bold text-xl leading-tight">JaroSmart</span>
      </div>
    );
  }

  // Full variant shows the complete logo
  return logoImage;
}

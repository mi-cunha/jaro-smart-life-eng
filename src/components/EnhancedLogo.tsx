import { useState } from 'react';
interface EnhancedLogoProps {
  src?: string;
  alt: string;
  className?: string;
  showText?: boolean;
}
export function EnhancedLogo({
  src,
  alt,
  className,
  showText = false
}: EnhancedLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Always show the custom logo design matching the attached image
  return <div className={`${className} flex items-center justify-center bg-green-600 rounded-lg px-4 py-2 shadow-lg`}>
      <div className="flex items-center space-x-2">
        {/* Lightning bolt icon in circle */}
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-green-600 fill-green-600 rounded-none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        
        {/* JaroSmart text */}
        <div className="text-white font-bold text-lg leading-tight">
          JaroSmart
        </div>
      </div>
    </div>;
}
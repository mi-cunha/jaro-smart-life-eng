
import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface EnhancedLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export function EnhancedLogo({ src, alt, className }: EnhancedLogoProps) {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true);
      setError(null);
      
      try {
        // Fetch the original image
        const response = await fetch(src);
        const blob = await response.blob();
        
        // Load image element
        const img = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(img);
        
        // Create URL for processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
        
        console.log('Logo background removed successfully');
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Erro ao processar logo');
        // Fallback to original image
        setProcessedImageUrl(src);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function
    return () => {
      if (processedImageUrl && processedImageUrl !== src) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [src]);

  if (isProcessing) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center`}>
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <img 
      src={processedImageUrl || src}
      alt={alt}
      className={`${className} drop-shadow-lg`}
      style={{
        filter: processedImageUrl ? 'contrast(1.1) brightness(1.05)' : undefined
      }}
      onError={() => {
        console.error('Error loading processed image, falling back to original');
        setProcessedImageUrl(src);
      }}
    />
  );
}

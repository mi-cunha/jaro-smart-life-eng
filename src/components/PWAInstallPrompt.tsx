
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Mostrar prompt automaticamente após 2 segundos se não estiver instalado e não foi dispensado
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    // Listener para quando o app for instalado
    const handleAppInstalled = () => {
      console.log('JaroSmart PWA foi instalado!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success('JaroSmart instalado com sucesso! 🎉');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Para iOS Safari
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast.info('Para instalar no iOS: toque no ícone de compartilhar e selecione "Adicionar à Tela de Início"', {
          duration: 5000
        });
        return;
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
        toast.success('Instalando JaroSmart...');
      } else {
        console.log('Usuário rejeitou instalar o PWA');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      toast.error('Erro ao instalar o app');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm animate-in slide-in-from-top-2 duration-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5 text-green-500" />
              Instalar JaroSmart
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/70 hover:text-white h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/80 text-sm">
            Instale o JaroSmart em seu dispositivo para uma experiência completa e acesso rápido!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-white/20 text-white/70 hover:text-white"
              size="sm"
            >
              Agora não
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

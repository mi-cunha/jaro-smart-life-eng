
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="text-8xl font-bold text-neon-green mb-4">404</div>
          <h1 className="text-3xl font-bold text-white mb-4">Página não encontrada</h1>
          <p className="text-white/70 mb-8">
            Oops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-neon-green text-black hover:bg-neon-green/90"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Home
          </Button>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-neon-green">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-sm">JaroSmart</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

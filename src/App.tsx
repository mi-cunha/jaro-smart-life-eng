import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthWrapper } from "@/components/AuthWrapper";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PesoProvider } from "@/contexts/PesoContext";
import { usePWA } from "@/hooks/usePWA";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ChaJaro = lazy(() => import("./pages/ChaJaro"));
const ProgressoPeso = lazy(() => import("./pages/ProgressoPeso"));
const HabitTracker = lazy(() => import("./pages/HabitTracker"));
const GeradorReceitas = lazy(() => import("./pages/GeradorReceitas"));
const ListaCompras = lazy(() => import("./pages/ListaCompras"));
const ColecaoReceitas = lazy(() => import("./pages/ColecaoReceitas"));
const DashboardGeral = lazy(() => import("./pages/DashboardGeral"));
const Perfil = lazy(() => import("./pages/Perfil"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const AppContent = () => {
  const { user } = useAuth();
  
  // Inicializar PWA
  usePWA();

  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider>
        <Suspense fallback={<PageLoader />}>
          {/* Only provide PesoProvider context for authenticated users */}
          {user ? (
            <PesoProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/cha-jaro" element={<ChaJaro />} />
                <Route path="/progresso-peso" element={<ProgressoPeso />} />
                <Route path="/habit-tracker" element={<HabitTracker />} />
                <Route path="/gerador-receitas" element={<GeradorReceitas />} />
                <Route path="/lista-compras" element={<ListaCompras />} />
                <Route path="/colecao-receitas" element={<ColecaoReceitas />} />
                <Route path="/dashboard" element={<DashboardGeral />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PesoProvider>
          ) : (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={<Auth />} />
            </Routes>
          )}
        </Suspense>
        <PWAInstallPrompt />
      </SidebarProvider>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

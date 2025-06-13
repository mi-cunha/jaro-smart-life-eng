
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import ChaJaro from "./pages/ChaJaro";
import ProgressoPeso from "./pages/ProgressoPeso";
import HabitTracker from "./pages/HabitTracker";
import GeradorReceitas from "./pages/GeradorReceitas";
import ListaCompras from "./pages/ListaCompras";
import ColecaoReceitas from "./pages/ColecaoReceitas";
import DashboardGeral from "./pages/DashboardGeral";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen flex w-full">
          <SidebarProvider>
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
          </SidebarProvider>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

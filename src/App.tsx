
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
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
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-black">
            <AppSidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
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
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

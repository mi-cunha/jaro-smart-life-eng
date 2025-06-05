import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Calendar, Scale, CheckCircle, ChefHat, ShoppingCart, Heart, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { EnhancedLogo } from "./EnhancedLogo";
import { JaroSmartLogo } from "./JaroSmartLogo";

const menuItems = [{
  title: "Home",
  url: "/",
  icon: Home
}, {
  title: "Chá Jaro",
  url: "/cha-jaro",
  icon: Calendar
}, {
  title: "Progresso de Peso",
  url: "/progresso-peso",
  icon: Scale
}, {
  title: "Habit Tracker",
  url: "/habit-tracker",
  icon: CheckCircle
}, {
  title: "Gerador de Receitas",
  url: "/gerador-receitas",
  icon: ChefHat
}, {
  title: "Lista de Compras",
  url: "/lista-compras",
  icon: ShoppingCart
}, {
  title: "Coleção de Receitas",
  url: "/colecao-receitas",
  icon: Heart
}, {
  title: "Dashboard Geral",
  url: "/dashboard",
  icon: BarChart3
}, {
  title: "Perfil",
  url: "/perfil",
  icon: User
}];

export function AppSidebar() {
  const location = useLocation();
  return <Sidebar className="border-r border-white/10">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <EnhancedLogo src="/lovable-uploads/50e82e9e-fa28-4fb0-8893-4a7b15a08201.png" alt="JaroSmart Logo" className="w-12 h-12 flex-shrink-0" />
          <span className="text-neon-green font-semibold">JaroSmart</span>
        </div>
        
        {/* Logo alternativo mais elaborado (descomente para usar) */}
        {/* <JaroSmartLogo size="md" variant="full" animated={true} /> */}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={location.pathname === item.url ? "bg-neon-green/20 text-neon-green" : "text-white hover:bg-white/10 hover:text-neon-green"}>
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="text-xs text-white/50 text-center">© 2025 JaroSmart</div>
      </SidebarFooter>
    </Sidebar>;
}

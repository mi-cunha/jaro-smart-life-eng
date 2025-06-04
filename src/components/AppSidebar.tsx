import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Calendar, Scale, CheckCircle, ChefHat, ShoppingCart, Heart, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
          <div className="relative">
            <img src="/lovable-uploads/70bf8baa-4aca-498a-b434-b6e5cd3db328.png" alt="JaroSmart Logo" style={{
            filter: 'brightness(0) saturate(100%) invert(85%) sepia(75%) saturate(4841%) hue-rotate(86deg) brightness(108%) contrast(103%)'
          }} className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center object-cover" />
          </div>
          <span className="text-neon-green">JaroSmart</span>
        </div>
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
        <div className="text-xs text-white/50 text-center">
          © 2024 JaroSmart
        </div>
      </SidebarFooter>
    </Sidebar>;
}
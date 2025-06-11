
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Calendar, Scale, CheckCircle, ChefHat, ShoppingCart, Heart, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { EnhancedLogo } from "./EnhancedLogo";
import { useSidebar } from "@/components/ui/sidebar";

const menuItems = [{
  title: "Home",
  url: "/",
  icon: Home
}, {
  title: "Jaro Tea",
  url: "/cha-jaro",
  icon: Calendar
}, {
  title: "Weight Progress",
  url: "/progresso-peso",
  icon: Scale
}, {
  title: "Habit Tracker",
  url: "/habit-tracker",
  icon: CheckCircle
}, {
  title: "Recipe Generator",
  url: "/gerador-receitas",
  icon: ChefHat
}, {
  title: "Shopping List",
  url: "/lista-compras",
  icon: ShoppingCart
}, {
  title: "Recipe Collection",
  url: "/colecao-receitas",
  icon: Heart
}, {
  title: "General Dashboard",
  url: "/dashboard",
  icon: BarChart3
}, {
  title: "Profile",
  url: "/perfil",
  icon: User
}];

export function AppSidebar() {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleMenuClick = () => {
    // Close sidebar on mobile after selecting an item
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return <Sidebar className="border-r border-white/10">
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-center">
          <EnhancedLogo alt="JaroSmart Logo" className="h-12" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={location.pathname === item.url ? "bg-neon-green/20 text-neon-green" : "text-white hover:bg-white/10 hover:text-neon-green"}
                    onClick={handleMenuClick}
                  >
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

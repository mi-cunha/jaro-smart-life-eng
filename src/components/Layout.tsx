
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumb?: string[];
}

export function Layout({
  children,
  title,
  breadcrumb
}: LayoutProps) {
  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-black">
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 safe-area-top">
          <div className="container flex h-16 items-center px-4">
            <SidebarTrigger className="text-white hover:text-neon-green sidebar-trigger" />
            <div className="ml-4 flex-1 min-w-0">
              {breadcrumb && (
                <nav className="text-sm text-white/70 mb-1 truncate">
                  {breadcrumb.map((item, index) => (
                    <span key={index}>
                      {item}
                      {index < breadcrumb.length - 1 && " > "}
                    </span>
                  ))}
                </nav>
              )}
              {title && (
                <h1 className="text-neon-green text-base font-bold truncate">
                  {title}
                </h1>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 pb-safe safe-area-bottom">
          <div className="mobile-optimized">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

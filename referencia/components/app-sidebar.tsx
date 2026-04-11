"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Download,
  Plug,
  Library,
  BookOpen,
  Moon,
  Sun,
  Zap,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buscar", label: "Buscar Mangá", icon: Search },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/conectores", label: "Conectores", icon: Plug },
  { href: "/biblioteca", label: "Biblioteca / KCC", icon: Library },
];

export function AppSidebar({ open, onClose, theme, onToggleTheme }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-sidebar-border p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">MangaFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Download & Conversão</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30"
                      : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground border border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onToggleTheme}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                Modo Claro
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                Modo Escuro
              </>
            )}
          </Button>
          <div className="mt-4 flex items-center gap-2 px-3">
            <BookOpen className="h-4 w-4 text-sidebar-foreground/50" />
            <span className="text-xs text-sidebar-foreground/50">v2.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

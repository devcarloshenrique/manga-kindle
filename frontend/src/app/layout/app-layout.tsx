import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Download,
  FolderKanban,
  Home,
  Menu,
  Moon,
  Plug,
  Search,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui';
import { useTheme } from '@/app/providers/theme-provider';

const navItems = [
  { to: ROUTES.HOME, icon: Home, label: 'Dashboard' },
  { to: ROUTES.SEARCH, icon: Search, label: 'Buscar Manga' },
  { to: ROUTES.DOWNLOADS, icon: Download, label: 'Downloads' },
  { to: ROUTES.LIBRARY, icon: FolderKanban, label: 'Biblioteca/KCC' },
  { to: ROUTES.CONNECTORS, icon: Plug, label: 'Conectores' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
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
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.HOME}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all border',
                    isActive
                      ? 'bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30'
                      : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground border-transparent',
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={toggleTheme}
          >
            {resolvedTheme === 'dark' ? (
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

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold">MangaFlow</span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden lg:inline-flex"
              title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

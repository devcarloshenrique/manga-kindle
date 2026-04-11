import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  Download,
  FolderKanban,
  Home,
  Menu,
  Plug,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { ThemeToggle } from '@/components/shared';
import { Button, Separator } from '@/components/ui';

const navItems = [
  { to: ROUTES.HOME, icon: Home, label: 'Dashboard' },
  { to: ROUTES.SEARCH, icon: Search, label: 'Buscar Manga' },
  { to: ROUTES.DOWNLOADS, icon: Download, label: 'Downloads' },
  { to: ROUTES.LIBRARY, icon: FolderKanban, label: 'Biblioteca/KCC' },
  { to: ROUTES.CONNECTORS, icon: Plug, label: 'Conectores' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <BookOpen className="h-7 w-7 text-[hsl(var(--primary))]" />
          <span className="text-xl font-bold tracking-tight">MangaKindle</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between p-4">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">v2.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center gap-4 border-b border-[hsl(var(--border))] px-6 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="font-semibold">MangaKindle</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FolderOpen,
  HelpCircle,
  History,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui';
import { useDownloads } from '@/hooks';
import { useTheme } from '@/app/providers/theme-provider';

type NavItem = {
  to: string;
  icon: typeof BookOpen;
  label: string;
  shortLabel: string;
  description: string;
  badge?: () => number | string | undefined;
};

const navItems: NavItem[] = [
  {
    to: ROUTES.HOME,
    icon: BookOpen,
    label: 'Biblioteca',
    shortLabel: 'Biblioteca',
    description: 'Seus mangás baixados',
  },
  {
    to: ROUTES.DOWNLOADS,
    icon: Download,
    label: 'Downloads',
    shortLabel: 'Downloads',
    description: 'Acompanhar filas e progresso',
    badge: undefined,
  },
  {
    to: ROUTES.SEARCH,
    icon: Search,
    label: 'Buscar',
    shortLabel: 'Buscar',
    description: 'Encontrar novo mangá por URL',
  },
  {
    to: '/history',
    icon: Clock,
    label: 'Histórico',
    shortLabel: 'Histórico',
    description: 'Histórico de leitura',
  },
  {
    to: '/folders',
    icon: FolderOpen,
    label: 'Pastas',
    shortLabel: 'Pastas',
    description: 'Organizar em pastas',
  },
  {
    to: ROUTES.CONVERT,
    icon: Wand2,
    label: 'Converter',
    shortLabel: 'Converter',
    description: 'Converter para Kindle/e-reader',
  },
];

const bottomItems: NavItem[] = [
  {
    to: '/stats',
    icon: BarChart3,
    label: 'Estatísticas',
    shortLabel: 'Stats',
    description: 'Estatísticas do acervo',
  },
  {
    to: ROUTES.SETTINGS,
    icon: Settings,
    label: 'Configurações',
    shortLabel: 'Config.',
    description: 'Conectores, tema e preferências',
  },
  {
    to: '/help',
    icon: HelpCircle,
    label: 'Ajuda',
    shortLabel: 'Ajuda',
    description: 'Ajuda e suporte',
  },
];

const mobileTabItems = navItems.slice(0, 5);

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { activeDownloads } = useDownloads();

  const resolvedTheme =
    theme === 'system'
      ? typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  const toggleTheme = () =>
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const allNavItems = useMemo(() => [...navItems, ...bottomItems], []);
  const currentNavItem = useMemo(
    () =>
      allNavItems.find((item) =>
        item.to === ROUTES.HOME
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to),
      ),
    [location.pathname, allNavItems],
  );

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para conteúdo principal
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out lg:translate-x-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Menu lateral"
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center border-b border-sidebar-border h-16 px-4',
            sidebarCollapsed && 'justify-center',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 flex flex-col min-w-0">
              <h1 className="text-base font-bold tracking-tight truncate">MangaFlow</h1>
              <p className="text-[11px] text-muted-foreground truncate">Download & Conversão</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'ml-auto text-sidebar-foreground hover:bg-sidebar-accent',
              sidebarCollapsed && 'hidden',
            )}
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto p-2"
          aria-label="Navegação principal"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.to === ROUTES.HOME
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
              const badgeCount =
                item.to === ROUTES.DOWNLOADS ? activeDownloads.length : 0;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.HOME}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 h-10 justify-start rounded-lg px-3 text-sm transition-all',
                    sidebarCollapsed && 'justify-center px-2',
                    isActive && 'bg-sidebar-accent text-sidebar-primary font-medium',
                    !isActive && 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground',
                    )}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                          {badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className={cn('border-t border-sidebar-border p-2', sidebarCollapsed && 'px-1')}>
          <div className="flex flex-col gap-1">
            {bottomItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 h-10 justify-start rounded-lg px-3 text-sm transition-all',
                    sidebarCollapsed && 'justify-center px-2',
                    isActive && 'bg-sidebar-accent text-sidebar-primary font-medium',
                    !isActive && 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0 text-sidebar-foreground" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-2 flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-full text-sidebar-foreground hover:bg-sidebar-accent',
                sidebarCollapsed && 'justify-center px-2',
                !sidebarCollapsed && 'justify-start gap-3 h-10 px-3',
              )}
              onClick={toggleTheme}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              {!sidebarCollapsed && (
                <span className="text-sm">
                  {resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              )}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <div className="mt-2 flex items-center gap-2 px-3">
              <Sparkles className="h-3.5 w-3.5 text-sidebar-foreground/40" />
              <span className="text-[11px] text-sidebar-foreground/40">
                v2.0 — Redesign
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Collapse toggle button (outside sidebar, positioned relative to aside via left-64 or left-16) */}
      <div
        className={cn(
          'fixed top-20 z-40 hidden lg:block transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'left-16' : 'left-64',
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -translate-x-1/2 rounded-full border border-border bg-background shadow-md hover:bg-secondary"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
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
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {currentNavItem && !sidebarCollapsed && (
              <p className="hidden text-sm text-muted-foreground xl:block max-w-xs truncate">
                {currentNavItem.description}
              </p>
            )}

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

            <Button asChild className="hidden md:inline-flex" size="sm">
              <NavLink to={ROUTES.SEARCH}>
                <Search className="h-4 w-4" />
                Buscar
              </NavLink>
            </Button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="p-4 pb-24 lg:p-8 lg:pb-8"
          role="main"
        >
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 glass-strong lg:hidden"
          aria-label="Navegação rápida mobile"
        >
          <ul className="grid grid-cols-4">
            {mobileTabItems.map((item) => {
              const isActive =
                item.to === ROUTES.HOME
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
              const badgeCount =
                item.to === ROUTES.DOWNLOADS ? activeDownloads.length : 0;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === ROUTES.HOME}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5',
                        isActive && 'drop-shadow-[0_0_6px_var(--primary)]',
                      )}
                    />
                    <span className="truncate">{item.shortLabel}</span>
                    {badgeCount > 0 && (
                      <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                        {badgeCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

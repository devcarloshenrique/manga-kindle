import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Download,
  FolderKanban,
  Home,
  LayoutGrid,
  Menu,
  Moon,
  Plug,
  Search,
  Sun,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui';
import { useTheme } from '@/app/providers/theme-provider';

type NavItem = {
  to: string;
  icon: typeof Home;
  label: string;
  shortLabel: string;
  description: string;
  primary?: boolean;
};

const navSections: ReadonlyArray<{ title: string; icon: typeof LayoutGrid; items: ReadonlyArray<NavItem> }> = [
  {
    title: 'Principal',
    icon: LayoutGrid,
    items: [
      {
        to: ROUTES.HOME,
        icon: Home,
        label: 'Dashboard',
        shortLabel: 'Início',
        description: 'Resumo do sistema e atalhos rápidos',
        primary: true,
      },
      {
        to: ROUTES.SEARCH,
        icon: Search,
        label: 'Buscar Mangá',
        shortLabel: 'Buscar',
        description: 'Encontrar novo mangá por URL',
        primary: true,
      },
      {
        to: ROUTES.LIBRARY,
        icon: FolderKanban,
        label: 'Biblioteca/KCC',
        shortLabel: 'Biblioteca',
        description: 'Ler offline e converter capítulos',
        primary: true,
      },
    ],
  },
  {
    title: 'Operações',
    icon: Workflow,
    items: [
      {
        to: ROUTES.DOWNLOADS,
        icon: Download,
        label: 'Downloads',
        shortLabel: 'Downloads',
        description: 'Acompanhar filas e progresso',
      },
      {
        to: ROUTES.CONNECTORS,
        icon: Plug,
        label: 'Conectores',
        shortLabel: 'Conexões',
        description: 'Fontes e idiomas disponíveis',
      },
    ],
  },
];

const allNavItems = navSections.flatMap((section) => section.items);
const mobileQuickNav = allNavItems.filter((item) => item.primary).slice(0, 4);

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const resolvedTheme =
    theme === 'system'
      ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const currentNavItem = useMemo(
    () => allNavItems.find((item) => (item.to === ROUTES.HOME ? location.pathname === item.to : location.pathname.startsWith(item.to))),
    [location.pathname],
  );

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para conteúdo principal
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Menu lateral"
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
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Navegação principal">
          <div className="space-y-5">
            {navSections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === ROUTES.HOME}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all border',
                          isActive
                            ? 'bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground border-transparent',
                        )
                      }
                    >
                      <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{item.label}</span>
                        <span className="block truncate text-xs text-sidebar-foreground/60">{item.description}</span>
                      </span>
                    </NavLink>
                  ))}
                </div>
              </section>
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

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {currentNavItem ? (
              <p className="hidden text-sm text-muted-foreground xl:block">
                {currentNavItem.description}
              </p>
            ) : null}

            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <NavLink to={ROUTES.SEARCH}>
                <Search className="h-4 w-4" />
                Buscar
              </NavLink>
            </Button>

            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <NavLink to={ROUTES.LIBRARY}>
                <FolderKanban className="h-4 w-4" />
                Biblioteca
              </NavLink>
            </Button>

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
        <main id="main-content" className="p-4 pb-24 lg:p-6 lg:pb-6" role="main">
          <Outlet />
        </main>

        {/* Mobile quick navigation */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
          aria-label="Navegação rápida mobile"
        >
          <ul className="grid grid-cols-3">
            {mobileQuickNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === ROUTES.HOME}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-2 py-2 text-xs transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.shortLabel}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

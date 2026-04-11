import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-[hsl(var(--primary))] transition-colors"
            >
              {item.label}
            </Link>
          ) : item.onClick ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={item.onClick}
              className="h-auto p-0 text-sm hover:text-[hsl(var(--primary))]"
            >
              {item.label}
            </Button>
          ) : (
            <span className="font-medium text-[hsl(var(--foreground))]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';

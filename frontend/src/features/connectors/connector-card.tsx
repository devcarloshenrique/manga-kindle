import { Globe, ExternalLink } from 'lucide-react';
import type { Connector } from '@/services/types';
import {
  Card,
  CardContent,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@/components/ui';

interface ConnectorCardProps {
  connector: Connector;
  onSetLanguage?: (name: string, language: string) => void;
  disabled?: boolean;
}

export function ConnectorCard({ connector, onSetLanguage, disabled }: ConnectorCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Globe className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h3 className="font-semibold">{connector.displayName}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{connector.baseUrl}</p>
              {connector.currentLanguage && (
                <Badge variant="secondary" className="mt-1">
                  Idioma: {connector.currentLanguage}
                </Badge>
              )}
            </div>
          </div>
          <a href={connector.baseUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {connector.supportedLanguages && connector.supportedLanguages.length > 0 && onSetLanguage && (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Idioma preferido</label>
            <Select
              value={connector.currentLanguage || ''}
              onValueChange={(value) => onSetLanguage(connector.name, value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {connector.supportedLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

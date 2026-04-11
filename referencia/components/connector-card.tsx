"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./status-badge";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { Connector } from "@/lib/mock-data";

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{connector.name}</h3>
            <a
              href={connector.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              {connector.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <StatusBadge status={connector.healthy ? "healthy" : "unhealthy"} />
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Idioma preferido</Label>
            <Select defaultValue={connector.language}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-br">Português (BR)</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            <RefreshCw className="mr-2 h-3 w-3" />
            Testar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

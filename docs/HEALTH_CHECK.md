# Health Check Endpoint

## 🏥 GET /api/connectors/health

Endpoint para verificar o status de saúde de todos os conectores disponíveis na API.

### Descrição

Este endpoint testa automaticamente todos os conectores disponíveis executando:
- **getMangaInfo**: Busca informações de um mangá de teste
- **getChapterPages**: Busca páginas de um capítulo de teste

Para cada teste, retorna:
- Status (healthy/unhealthy/degraded)
- Tempo de resposta em milissegundos
- URL testada
- Mensagem de erro (se houver)

### Request

```bash
GET http://localhost:3000/api/connectors/health
```

```bash
curl http://localhost:3000/api/connectors/health
```

### Response

```json
{
  "timestamp": "2026-03-01T19:50:40.688Z",
  "status": "healthy",
  "totalConnectors": 2,
  "healthyConnectors": 2,
  "connectors": [
    {
      "name": "mangalivre",
      "displayName": "Manga Livre",
      "status": "healthy",
      "endpoints": {
        "getMangaInfo": {
          "status": "healthy",
          "responseTime": 979,
          "testedUrl": "https://mangalivre.to/manga/one-piece"
        },
        "getChapterPages": {
          "status": "healthy",
          "responseTime": 335,
          "testedUrl": "https://mangalivre.to/manga/one-piece/1"
        }
      }
    },
    {
      "name": "mangadex",
      "displayName": "MangaDex",
      "status": "healthy",
      "endpoints": {
        "getMangaInfo": {
          "status": "healthy",
          "responseTime": 1091,
          "testedUrl": "https://mangadex.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8"
        },
        "getChapterPages": {
          "status": "healthy",
          "responseTime": 1008,
          "testedUrl": "https://mangadex.org/chapter/9aab37f1-faf2-4204-b90d-c005d969c42f"
        }
      }
    }
  ]
}
```

### Response Fields

#### Root Object

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `timestamp` | string | ISO 8601 timestamp da execução do health check |
| `status` | string | Status geral do sistema: `healthy`, `degraded`, `unhealthy` |
| `totalConnectors` | number | Número total de conectores testados |
| `healthyConnectors` | number | Número de conectores com status healthy |
| `connectors` | array | Lista de conectores testados |

#### Connector Object

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Identificador do conector |
| `displayName` | string | Nome exibível do conector |
| `status` | string | Status do conector: `healthy`, `degraded`, `unhealthy` |
| `endpoints` | object | Status de cada endpoint testado |

#### Endpoint Test Result

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | `healthy` ou `unhealthy` |
| `responseTime` | number | Tempo de resposta em milissegundos |
| `testedUrl` | string | URL utilizada no teste |
| `error` | string | Mensagem de erro (apenas se unhealthy) |

### Status Codes

- **200 OK**: Health check executado com sucesso (mesmo que alguns conectores estejam unhealthy)

### Status Levels

#### Overall System Status

- **healthy**: Todos os conectores estão funcionando perfeitamente
- **degraded**: Alguns conectores ou endpoints estão com problemas
- **unhealthy**: Nenhum conector está funcionando

#### Connector Status

- **healthy**: Todos os endpoints do conector estão funcionando
- **degraded**: Alguns endpoints estão funcionando
- **unhealthy**: Nenhum endpoint está funcionando
- **skipped**: Conector não possui URLs de teste configuradas

### Exemplo de Response com Erro

```json
{
  "timestamp": "2026-03-01T20:00:00.000Z",
  "status": "degraded",
  "totalConnectors": 2,
  "healthyConnectors": 1,
  "connectors": [
    {
      "name": "mangalivre",
      "displayName": "Manga Livre",
      "status": "healthy",
      "endpoints": {
        "getMangaInfo": {
          "status": "healthy",
          "responseTime": 879,
          "testedUrl": "https://mangalivre.to/manga/one-piece"
        },
        "getChapterPages": {
          "status": "healthy",
          "responseTime": 435,
          "testedUrl": "https://mangalivre.to/manga/one-piece/1"
        }
      }
    },
    {
      "name": "mangadex",
      "displayName": "MangaDex",
      "status": "degraded",
      "endpoints": {
        "getMangaInfo": {
          "status": "healthy",
          "responseTime": 1291,
          "testedUrl": "https://mangadex.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8"
        },
        "getChapterPages": {
          "status": "unhealthy",
          "error": "Request timeout",
          "testedUrl": "https://mangadex.org/chapter/9aab37f1-faf2-4204-b90d-c005d969c42f"
        }
      }
    }
  ]
}
```

### Uso Recomendado

#### 1. Monitoramento

Use este endpoint para monitoramento contínuo:

```bash
# Script de monitoramento simples
while true; do
  STATUS=$(curl -s http://localhost:3000/api/connectors/health | jq -r '.status')
  echo "$(date): System status: $STATUS"
  if [ "$STATUS" != "healthy" ]; then
    echo "⚠️  Alert: System is $STATUS"
    # Enviar notificação, etc
  fi
  sleep 300  # Check every 5 minutes
done
```

#### 2. CI/CD Health Check

```bash
# Em pipeline de deploy
response=$(curl -s http://localhost:3000/api/connectors/health)
status=$(echo $response | jq -r '.status')

if [ "$status" == "unhealthy" ]; then
  echo "❌ Health check failed!"
  exit 1
fi

echo "✅ All connectors healthy"
```

#### 3. Dashboard Integration

```javascript
// Exemplo com fetch no frontend
async function checkConnectorHealth() {
  const response = await fetch('/api/connectors/health');
  const data = await response.json();
  
  // Update UI based on health status
  data.connectors.forEach(connector => {
    const element = document.getElementById(`connector-${connector.name}`);
    element.className = `status-${connector.status}`;
    
    // Show response times
    Object.entries(connector.endpoints).forEach(([endpoint, result]) => {
      const timeElement = document.getElementById(
        `${connector.name}-${endpoint}-time`
      );
      timeElement.textContent = `${result.responseTime}ms`;
    });
  });
}

// Check every 30 seconds
setInterval(checkConnectorHealth, 30000);
```

### Performance

- **Tempo médio**: 2-4 segundos (testa todos os conectores em paralelo)
- **Timeout**: Nenhum timeout configurado - depende dos timeouts dos conectores individuais
- **Cache**: Não há cache - sempre executa testes em tempo real

### Notas

- Este endpoint faz requisições reais aos sites de mangá
- Pode ser lento se os sites estiverem lentos
- Use com moderação para não sobrecarregar os sites
- Ideal para monitoramento com intervalos de 5+ minutos
- URLs de teste são configuradas diretamente no código do controller

### Swagger/OpenAPI

Este endpoint está documentado no Swagger em:
```
http://localhost:3000/docs
```

Tag: **Connectors**

/**
 * Value Object: Manga URL
 * Encapsula a validação e extração de informações de uma URL de mangá
 */
export class MangaUrl {
  private readonly _value: string;
  private readonly _slug: string;
  private readonly _source: string;

  private constructor(url: string, slug: string, source: string) {
    this._value = url;
    this._slug = slug;
    this._source = source;
  }

  static create(url: string): MangaUrl {
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
    
    // Detecta a fonte baseado na URL
    const sourcePatterns: Record<string, RegExp> = {
      'mangalivre': /mangalivre\.to\/manga\/([^\/]+)/,
      // Adicione mais padrões aqui para novos conectores
    };

    for (const [source, pattern] of Object.entries(sourcePatterns)) {
      const match = normalizedUrl.match(pattern);
      if (match) {
        return new MangaUrl(normalizedUrl, match[1], source);
      }
    }

    throw new Error(`URL de mangá inválida ou fonte não suportada: ${url}`);
  }

  get value(): string {
    return this._value;
  }

  get slug(): string {
    return this._slug;
  }

  get source(): string {
    return this._source;
  }

  toString(): string {
    return this._value;
  }
}

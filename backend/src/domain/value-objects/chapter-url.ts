/**
 * Value Object: Chapter URL
 * Encapsula a validação e extração de informações de uma URL de capítulo
 */
export class ChapterUrl {
  private readonly _value: string;
  private readonly _mangaSlug: string;
  private readonly _chapterNumber: string;
  private readonly _source: string;

  private constructor(url: string, mangaSlug: string, chapterNumber: string, source: string) {
    this._value = url;
    this._mangaSlug = mangaSlug;
    this._chapterNumber = chapterNumber;
    this._source = source;
  }

  static create(url: string): ChapterUrl {
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;

    // Detecta a fonte e extrai informações baseado na URL
    const sourcePatterns: Record<string, RegExp> = {
      'mangalivre': /mangalivre\.to\/manga\/([^\/]+)\/capitulo-(\d+(?:\.\d+)?)/,
      // Adicione mais padrões aqui para novos conectores
    };

    for (const [source, pattern] of Object.entries(sourcePatterns)) {
      const match = normalizedUrl.match(pattern);
      if (match) {
        return new ChapterUrl(normalizedUrl, match[1], match[2], source);
      }
    }

    throw new Error(`URL de capítulo inválida ou fonte não suportada: ${url}`);
  }

  get value(): string {
    return this._value;
  }

  get mangaSlug(): string {
    return this._mangaSlug;
  }

  get chapterNumber(): string {
    return this._chapterNumber;
  }

  get source(): string {
    return this._source;
  }

  toString(): string {
    return this._value;
  }
}

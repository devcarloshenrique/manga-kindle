import sharp from 'sharp';

/**
 * Formatos de imagem suportados para conversão
 */
export type ImageFormat = 'original' | 'webp' | 'jpeg' | 'jpg' | 'png';

/**
 * Opções de conversão de imagem
 */
export interface ImageConversionOptions {
  format: ImageFormat;
  quality?: number; // 1-100, default: 85
}

/**
 * Resultado da conversão
 */
export interface ConvertedImage {
  buffer: Buffer;
  extension: string;
}

/**
 * Converte uma imagem para o formato especificado
 */
export async function convertImage(
  imageBuffer: Buffer,
  options: ImageConversionOptions
): Promise<ConvertedImage> {
  const { format, quality = 85 } = options;

  // Se for 'original', retorna como está
  if (format === 'original') {
    // Detecta a extensão original
    const ext = detectImageFormat(imageBuffer);
    return { buffer: imageBuffer, extension: ext };
  }

  let sharpInstance = sharp(imageBuffer);
  let extension: string;

  switch (format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      extension = '.webp';
      break;
    case 'jpeg':
    case 'jpg':
      sharpInstance = sharpInstance.jpeg({ quality });
      extension = '.jpg';
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ compressionLevel: Math.floor((100 - quality) / 10) });
      extension = '.png';
      break;
    default:
      throw new Error(`Formato não suportado: ${format}`);
  }

  const convertedBuffer = await sharpInstance.toBuffer();
  return { buffer: convertedBuffer, extension };
}

/**
 * Detecta o formato de uma imagem pelo magic number
 */
export function detectImageFormat(buffer: Buffer): string {
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return '.jpg';
  }
  
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return '.png';
  }
  
  // WebP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return '.webp';
  }
  
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }
  
  // Default
  return '.webp';
}

/**
 * Obtém a extensão de arquivo para um formato
 */
export function getExtensionForFormat(format: ImageFormat): string {
  switch (format) {
    case 'webp':
      return '.webp';
    case 'jpeg':
    case 'jpg':
      return '.jpg';
    case 'png':
      return '.png';
    default:
      return '.webp';
  }
}

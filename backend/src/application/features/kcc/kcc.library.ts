import fs from 'fs/promises';
import path from 'path';
import { getConvertedDir } from './kcc.service.js';
import type { ConvertedFile } from '../../../domain/entities/kcc.js';

const SUPPORTED_EXTENSIONS = ['.epub', '.mobi', '.cbz', '.kfx'];

/**
 * Formats file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gets file extension without dot
 */
function getFormat(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith('.') ? ext.substring(1).toUpperCase() : ext.toUpperCase();
}

/**
 * Lists all converted files
 */
export async function listConvertedFiles(): Promise<ConvertedFile[]> {
  const convertedDir = getConvertedDir();
  
  try {
    await fs.mkdir(convertedDir, { recursive: true });
    const files = await fs.readdir(convertedDir);
    
    const results: ConvertedFile[] = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        continue;
      }
      
      const filePath = path.join(convertedDir, file);
      const stat = await fs.stat(filePath);
      
      if (!stat.isFile()) {
        continue;
      }
      
      results.push({
        name: file,
        path: filePath,
        size: stat.size,
        sizeFormatted: formatFileSize(stat.size),
        format: getFormat(file),
        createdAt: stat.birthtime,
      });
    }
    
    // Sort by creation date (newest first)
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return results;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Gets details of a specific converted file
 */
export async function getConvertedFile(name: string): Promise<ConvertedFile | null> {
  const convertedDir = getConvertedDir();
  
  // Sanitize filename to prevent path traversal
  const sanitizedName = path.basename(name);
  const filePath = path.join(convertedDir, sanitizedName);
  
  // Verify path is within converted directory
  if (!filePath.startsWith(convertedDir)) {
    throw new Error('Invalid filename');
  }
  
  try {
    const stat = await fs.stat(filePath);
    
    if (!stat.isFile()) {
      return null;
    }
    
    const ext = path.extname(sanitizedName).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return null;
    }
    
    return {
      name: sanitizedName,
      path: filePath,
      size: stat.size,
      sizeFormatted: formatFileSize(stat.size),
      format: getFormat(sanitizedName),
      createdAt: stat.birthtime,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Gets the full path for downloading a converted file
 */
export async function getConvertedFilePath(name: string): Promise<string | null> {
  const file = await getConvertedFile(name);
  return file?.path || null;
}

/**
 * Deletes a converted file
 */
export async function deleteConvertedFile(name: string): Promise<boolean> {
  const file = await getConvertedFile(name);
  if (!file) {
    return false;
  }
  
  await fs.unlink(file.path);
  return true;
}

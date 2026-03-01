import { describe, it, expect } from 'vitest';
import { convertImage, getExtensionForFormat, type ImageFormat } from '../../../src/infrastructure/utils/image-converter.js';

describe('ImageConverter', () => {
  describe('getExtensionForFormat', () => {
    it('should return correct extension for webp', () => {
      const ext = getExtensionForFormat('webp');
      expect(ext).toBe('.webp');
    });

    it('should return correct extension for jpeg', () => {
      const ext = getExtensionForFormat('jpeg');
      expect(ext).toBe('.jpg');
    });

    it('should return correct extension for jpg', () => {
      const ext = getExtensionForFormat('jpg');
      expect(ext).toBe('.jpg');
    });

    it('should return correct extension for png', () => {
      const ext = getExtensionForFormat('png');
      expect(ext).toBe('.png');
    });

    it('should return webp extension for original format', () => {
      const ext = getExtensionForFormat('original');
      expect(ext).toBe('.webp');
    });
  });

  describe('convertImage', () => {
    it('should keep image unchanged when format is original', async () => {
      // Create a simple test buffer (1x1 pixel PNG)
      const testBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const result = await convertImage(testBuffer, { format: 'original' });
      expect(result.buffer).toEqual(testBuffer);
      expect(result.extension).toBe('.png');
    });

    it('should convert image to webp format', async () => {
      const testBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const result = await convertImage(testBuffer, { format: 'webp' });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.buffer).not.toEqual(testBuffer);
      expect(result.extension).toBe('.webp');
    });

    it('should convert image to jpeg format', async () => {
      const testBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const result = await convertImage(testBuffer, { format: 'jpeg' });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.extension).toBe('.jpg');
    });

    it('should convert image to png format', async () => {
      const testBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const result = await convertImage(testBuffer, { format: 'png' });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
      expect(result.extension).toBe('.png');
    });

    it('should convert with custom quality', async () => {
      const testBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const result = await convertImage(testBuffer, { format: 'jpeg', quality: 50 });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.extension).toBe('.jpg');
    });
  });
});

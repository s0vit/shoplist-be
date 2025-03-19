import { Test, TestingModule } from '@nestjs/testing';
import { UtilsService } from './utils.service';
import * as sharp from 'sharp';

// Mock the sharp library
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => {
    return {
      metadata: jest.fn().mockResolvedValue({ width: 300, height: 200 }),
      resize: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-webp-image')),
    };
  });
});

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    service = module.get<UtilsService>(UtilsService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCaseInsensitiveRegexFromString', () => {
    it('should create a case-insensitive regex from a simple string', () => {
      const result = service.createCaseInsensitiveRegexFromString('test');
      expect(result).toEqual(/^test$/i);
      expect('test').toMatch(result);
      expect('TEST').toMatch(result);
      expect('Test').toMatch(result);
      expect('tEsT').toMatch(result);
    });

    it('should escape special regex characters', () => {
      const specialString = 'test.with*special(chars)';
      const result = service.createCaseInsensitiveRegexFromString(specialString);
      expect(specialString).toMatch(result);
      expect('test.with*special(chars)').toMatch(result);
      expect('TEST.WITH*SPECIAL(CHARS)').toMatch(result);
      expect('test-with-special-chars').not.toMatch(result);
    });

    it('should match the entire string exactly', () => {
      const result = service.createCaseInsensitiveRegexFromString('test');
      expect('test').toMatch(result);
      expect('test123').not.toMatch(result);
      expect('123test').not.toMatch(result);
      expect('te st').not.toMatch(result);
    });
  });

  describe('convertToWebP', () => {
    it('should convert an image to WebP format without resizing when compression is disabled', async () => {
      const buffer = Buffer.from('test-image');
      const result = await service.convertToWebP(buffer, false);
      
      expect(sharp).toHaveBeenCalledWith(buffer);
      expect(sharp(buffer).webp).toHaveBeenCalled();
      expect(sharp(buffer).toBuffer).toHaveBeenCalled();
      expect(sharp(buffer).resize).not.toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('mocked-webp-image'));
    });

    it('should resize the image when it exceeds the maxDimension and compression is enabled', async () => {
      const buffer = Buffer.from('test-image');
      const result = await service.convertToWebP(buffer, true, 100);
      
      expect(sharp).toHaveBeenCalledWith(buffer);
      expect(sharp(buffer).metadata).toHaveBeenCalled();
      expect(sharp(buffer).resize).toHaveBeenCalledWith({
        width: 100,
        height: null,
        fit: 'inside',
      });
      expect(sharp(buffer).webp).toHaveBeenCalled();
      expect(sharp(buffer).toBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('mocked-webp-image'));
    });

    it('should not resize the image when it is smaller than the maxDimension', async () => {
      // Mock the metadata to return a small image
      (sharp as jest.Mock).mockImplementationOnce(() => ({
        metadata: jest.fn().mockResolvedValue({ width: 100, height: 80 }),
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-webp-image')),
      }));

      const buffer = Buffer.from('test-image');
      const result = await service.convertToWebP(buffer, true, 200);
      
      expect(sharp).toHaveBeenCalledWith(buffer);
      expect(sharp(buffer).metadata).toHaveBeenCalled();
      expect(sharp(buffer).resize).not.toHaveBeenCalled();
      expect(sharp(buffer).webp).toHaveBeenCalled();
      expect(sharp(buffer).toBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('mocked-webp-image'));
    });

    it('should handle errors during image processing', async () => {
      // Mock the metadata to throw an error
      (sharp as jest.Mock).mockImplementationOnce(() => ({
        metadata: jest.fn().mockRejectedValue(new Error('Image processing error')),
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mocked-webp-image')),
      }));

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const buffer = Buffer.from('test-image');
      const result = await service.convertToWebP(buffer);
      
      expect(sharp).toHaveBeenCalledWith(buffer);
      expect(sharp(buffer).metadata).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Image processing error'));
      expect(sharp(buffer).webp).toHaveBeenCalled();
      expect(sharp(buffer).toBuffer).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('mocked-webp-image'));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('normalizeDate', () => {
    it('should normalize a date to YYYY-MM-DD format', () => {
      const date = new Date('2023-01-15T12:30:45.123Z');
      const result = service.normalizeDate(date);
      expect(result).toBe('2023-01-15');
    });

    it('should handle different date inputs', () => {
      expect(service.normalizeDate(new Date('2023-01-01'))).toBe('2023-01-01');
      expect(service.normalizeDate(new Date('2023-12-31T23:59:59.999Z'))).toBe('2023-12-31');
      expect(service.normalizeDate(new Date('2023-06-15T00:00:00.000Z'))).toBe('2023-06-15');
    });

    it('should handle date objects with time components', () => {
      const date = new Date('2023-01-15T12:30:45.123Z');
      const result = service.normalizeDate(date);
      expect(result).toBe('2023-01-15');
    });
  });
});
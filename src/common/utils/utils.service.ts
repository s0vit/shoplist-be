import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class UtilsService {
  /**
   * Creates a case-insensitive regular expression to match the entire string exactly.
   * @param title - The string to create a regex for.
   * @returns A regular expression that matches the exact title, case-insensitively.
   * This is possible thanks to MongoDB's support for regular expressions in queries.
   */
  createTitleRegex(title: string): RegExp {
    return new RegExp(`^${title}$`, 'i');
  }

  async convertToWebP(buffer: Buffer): Promise<Buffer> {
    let convertedBuffer = buffer;

    try {
      const { width } = await sharp(buffer).metadata();

      if (width > 200) {
        convertedBuffer = await sharp(buffer).resize({ width: 200 }).webp().toBuffer();
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const { height } = await sharp(buffer).metadata();

      if (height > 200) {
        convertedBuffer = await sharp(buffer).resize({ height: 200 }).webp().toBuffer();
      }
    } catch (error) {
      console.error(error);
    }

    return sharp(convertedBuffer).webp().toBuffer();
  }
}

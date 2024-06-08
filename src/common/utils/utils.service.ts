import { Injectable } from '@nestjs/common';

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
}

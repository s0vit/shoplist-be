import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  createTitleRegex(title: string): RegExp {
    return new RegExp(`^${title}$`, 'i');
  }
}

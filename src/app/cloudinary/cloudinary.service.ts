import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {}
  async uploadImage(fileBuffer: Buffer): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        })
        .end(fileBuffer);
    });
  }
}

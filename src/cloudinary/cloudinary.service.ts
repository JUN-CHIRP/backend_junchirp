import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  public constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  public getUrl(publicId: string, options: { raw?: boolean } = {}): string {
    return cloudinary.url(publicId, {
      resource_type: options.raw ? 'raw' : 'image',
      secure: true,
    });
  }

  public async uploadProjectLogo(
    file: Express.Multer.File,
    projectId: string,
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `projects/${projectId}/logo`,
            public_id: `${projectId}_logo`,
          },
          (error, result) => {
            if (result) {
              resolve(result.secure_url);
            } else {
              reject(
                error ??
                  new InternalServerErrorException('Something went wrong'),
              );
            }
          },
        );

        Readable.from(file.buffer).pipe(stream);
      });
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}

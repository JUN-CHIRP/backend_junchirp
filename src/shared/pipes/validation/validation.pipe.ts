import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Type } from '@nestjs/common/interfaces/type.interface';

@Injectable()
export class ValidationPipe implements PipeTransform {
  public async transform<T>(value: T, metadata: ArgumentMetadata): Promise<T> {
    const object = plainToInstance(metadata.metatype as Type<object>, value);
    const errors = await validate(object);
    if (errors.length) {
      const messages = errors.map((error: ValidationError) => {
        return `${error.property} - ${Object.values(
          error.constraints as Record<string, string>,
        ).join(', ')}`;
      });
      throw new BadRequestException(messages, 'Validation Error');
    }
    return value;
  }
}

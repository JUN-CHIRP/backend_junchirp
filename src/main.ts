import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as cookieParser from 'cookie-parser';
import Redis from 'ioredis';
import helmet from 'helmet';
import { CsrfService } from './csrf/csrf.service';
import { NextFunction, Request, Response } from 'express';

async function bootstrap(): Promise<void> {
  const PORT = Number(process.env.PORT) || 4000;
  const useSSL = process.env.USE_SSL === 'true';

  const redis = new Redis(
    `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  );
  redis.on('error', (err) => console.error('Redis Error:', err));

  let httpsOptions: HttpsOptions | undefined;

  if (useSSL) {
    httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname, '..', 'ssl', 'localhost-key.pem'),
      ),
      cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.pem')),
    };
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });
  const csrfService = app.get(CsrfService);

  app.use(helmet());
  app.enableCors({
    origin: [
      'https://localhost:4200',
      'https://localhost:3000',
      'https://frontend-junchirp-123.vercel.app',
    ],
    credentials: true,
  });
  app.use(cookieParser(process.env.CSRF_SECRET ?? 'default_secret'));
  app.use((req: Request, res: Response, next: NextFunction) =>
    csrfService.doubleCsrfProtection(req, res, next),
  );
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('JunChirp')
    .setDescription('The JunChirp API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();

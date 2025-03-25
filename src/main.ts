import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as cookieParser from 'cookie-parser';
import Redis from 'ioredis';

async function bootstrap(): Promise<void> {
  const PORT = Number(process.env.PORT) || 4000;
  const useSSL = process.env.USE_SSL === 'true';
  const isRender = process.env.RENDER_ENV === 'true';

  let redis: Redis;
  let httpsOptions: HttpsOptions | undefined;

  if (useSSL && !isRender) {
    httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname, '..', 'ssl', 'localhost-key.pem'),
      ),
      cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.pem')),
    };
    redis = new Redis(
      `rediss://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    );
  } else {
    redis = new Redis(
      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    );
  }

  redis.on('error', (err) => console.error('Redis Error:', err));

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({ origin: '*' });
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('JunChirp')
    .setDescription('The JunChirp API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const PORT = Number(process.env.PORT ?? 3000);
  // const httpsOptions = {
  //   key: fs.readFileSync(
  //     path.join(__dirname, '..', 'ssl', 'localhost-key.pem')
  //   ),
  //   cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.pem')),
  // };

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('JunChirp')
    .setDescription('The JunChirp API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();

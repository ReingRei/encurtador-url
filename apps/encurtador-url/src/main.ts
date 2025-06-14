import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CoreConfigService } from '@app/core-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('BootstrapEncurtadorUrl');

  const coreConfigService = app.get(CoreConfigService);
  const port = coreConfigService.portEncurtador;
  const nodeEnv = coreConfigService.nodeEnv;
  logger.log(`Ambiente de execução: ${nodeEnv}`);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('API Encurtador de URL')
    .setDescription(
      'Documentação da API responsável pelo encurtamento e gestão de URLs.',
    )
    .setVersion('0.2.0')
    .addTag('Encurtador', 'Operações relacionadas ao encurtamento de URLs')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT aqui',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`Aplicação Encurtador de URL rodando na porta ${port}`);
  logger.log(
    `Documentação da API disponível em http://localhost:${port}/api/docs`,
  );
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CoreConfigService } from '@app/core-config';
import { AutenticacaoModule } from 'apps/autenticacao/src/autenticacao.module';

async function bootstrap() {
  const app = await NestFactory.create(AutenticacaoModule);
  const logger = new Logger('BootstrapEncurtadorUrl');

  const coreConfigService = app.get(CoreConfigService);
  const port = coreConfigService.portAutenticacao;
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
    .setTitle('API Encurtador de URL - Teddy Open Finance')
    .setDescription(
      'Documentação da API responsável pelo encurtamento e gestão de URLs.',
    )
    .setVersion('0.2.0')
    .addTag('encurtador', 'Operações relacionadas ao encurtamento de URLs')
    .addTag(
      'redirecionamento',
      'Operações de redirecionamento de URLs encurtadas',
    )
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

  await app.listen(port);
  logger.log(`Aplicação Encurtador de URL rodando na porta ${port}`);
  logger.log(
    `Documentação da API disponível em http://localhost:${port}/api/docs`,
  );
}
bootstrap();

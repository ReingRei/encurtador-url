import { NestFactory } from '@nestjs/core';
import { AutenticacaoModule } from './autenticacao.module';
import { CoreConfigService } from '@app/core-config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AutenticacaoModule);
  const logger = new Logger('BootstrapAutenticacao');

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
    .setTitle('API de Autenticação - Encurtador URL')
    .setDescription(
      'Documentação da API responsável pelo cadastro e login de usuários.',
    )
    .setVersion('1.0')
    .addTag('Autenticacao', 'Operações relacionadas à autenticação de usuários')
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
  logger.log(`Aplicação de Autenticação rodando na porta ${port}`);
  logger.log(
    `Documentação da API disponível em http://localhost:${port}/api/docs`,
  );
}
void bootstrap();

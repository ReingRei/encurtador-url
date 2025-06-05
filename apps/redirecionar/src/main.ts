import { NestFactory } from '@nestjs/core';
import { RedirecionarModule } from './redirecionar.module';
import { CoreConfigService } from '@app/core-config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(RedirecionarModule);
  const logger = new Logger('BootstrapRedirecionar');

  const coreConfigService = app.get(CoreConfigService);
  const port = coreConfigService.portRedirecionar;
  const nodeEnv = coreConfigService.nodeEnv;
  logger.log(`Ambiente de execução: ${nodeEnv}`);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('API de Autenticação - Redirecionar URL encurtada')
    .setDescription(
      'Documentação da API responsável por redirecionar a url encurtada.',
    )
    .setVersion('1.0')
    .addTag('Redirecionar', 'Operações relacionadas redirecionar usuários')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Aplicação de Redirecionar rodando na porta ${port}`);
  logger.log(
    `Documentação da API disponível em http://localhost:${port}/api/docs`,
  );
}
void bootstrap();

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class CoreConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV', 'development');
  }

  get dbHost(): string {
    return this.nestConfigService.getOrThrow<string>('DB_HOST');
  }

  get dbPort(): number {
    const port = this.nestConfigService.get<number>('DB_PORT');
    return port === undefined ? 5432 : port;
  }

  get dbUsername(): string {
    return this.nestConfigService.getOrThrow<string>('DB_USERNAME');
  }

  get dbPassword(): string {
    return this.nestConfigService.getOrThrow<string>('DB_PASSWORD');
  }

  get dbDatabase(): string {
    return this.nestConfigService.getOrThrow<string>('DB_DATABASE');
  }

  get dbSynchronize(): boolean {
    return this.nodeEnv !== 'production';
  }

  get dbLogging():
    | boolean
    | 'all'
    | ('query' | 'error' | 'schema' | 'warn' | 'info' | 'log')[] {
    return this.nodeEnv !== 'production' ? 'all' : ['error'];
  }

  // Configurações de JWT
  get jwtSecret(): string {
    return this.nestConfigService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpirationTime(): string {
    return this.nestConfigService.get<string>('JWT_EXPIRATION_TIME', '3600s');
  }

  // Configurações das Aplicações
  get portAutenticacao(): number {
    return this.nestConfigService.get<number>('PORT_AUTENTICACAO', 3001);
  }

  get portEncurtador(): number {
    return this.nestConfigService.get<number>('PORT_ENCURTADOR', 3002);
  }

  get portRedirecionar(): number {
    return this.nestConfigService.get<number>('PORT_REDIRECIONAR', 3002);
  }

  get baseUrlEncurtador(): string {
    return this.nestConfigService.get<string>(
      'APP_BASE_URL_ENCURTADOR',
      'localhost:3002',
    );
  }

  get baseUrlRedirecionar(): string {
    return this.nestConfigService.get<string>(
      'APP_BASE_URL_REDIRECIONAR',
      'localhost:3003',
    );
  }
}

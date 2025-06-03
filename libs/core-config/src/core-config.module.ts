import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigFrameworkModule } from '@nestjs/config'; // Importa o módulo do NestJS
import { CoreConfigService } from './core-config.service';

@Global()
@Module({
  imports: [
    NestConfigFrameworkModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [CoreConfigService],
  exports: [CoreConfigService],
})
export class CoreConfigModule {}

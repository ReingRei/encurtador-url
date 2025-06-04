import { Module } from '@nestjs/common';
import { EncurtadorUrlModule } from './encurtador-url/encurtador-url.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CoreConfigModule } from '@app/core-config';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CoreConfigModule,
    DatabaseModule,
    // Importando o módulo de encurtador de URL
    EncurtadorUrlModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

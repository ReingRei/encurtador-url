import { Module } from '@nestjs/common';
import { RedirecionarController } from './redirecionar.controller';
import { RedirecionarService } from './redirecionar.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CoreConfigModule } from '@app/core-config';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities';

@Module({
  imports: [
    CoreConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([UrlEncurtadaEntity]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
  ],
  controllers: [RedirecionarController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    RedirecionarService,
  ],
})
export class RedirecionarModule {}

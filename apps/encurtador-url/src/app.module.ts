import { Module } from '@nestjs/common';
import { EncurtadorUrlModule } from './encurtador-url/encurtador-url.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CoreConfigModule } from '@app/core-config';
import { DatabaseModule } from '@app/database';
import { JwtStrategy } from '@app/common/auth/jwt.strategy';

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
    EncurtadorUrlModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    JwtStrategy,
  ],
})
export class AppModule {}

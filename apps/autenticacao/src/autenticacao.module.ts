import { Module } from '@nestjs/common';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { CoreConfigModule, CoreConfigService } from '@app/core-config';
import { GerenciadorDeSenhaService } from './gerenciador-de-senha/gerenciador-de-senha.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from '@app/database/entities';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@app/common/auth/jwt.strategy';

@Module({
  imports: [
    CoreConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([UsuarioEntity]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [CoreConfigModule],
      useFactory: (coreConfigService: CoreConfigService) => ({
        secret: coreConfigService.jwtSecret,
        signOptions: {
          expiresIn: coreConfigService.jwtExpirationTime,
        },
      }),
      inject: [CoreConfigService],
    }),
    JwtModule,
  ],
  controllers: [AutenticacaoController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    JwtStrategy,
    AutenticacaoService,
    GerenciadorDeSenhaService,
  ],
})
export class AutenticacaoModule {}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CoreConfigService } from '@app/core-config';
import { ISessao } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly coreConfigService: CoreConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: coreConfigService.jwtSecret,
    });
    this.logger.log('JwtStrategy (common) inicializada.');
  }

  /**
   * Valida o payload do token JWT.
   * Chamado pelo Passport após o token ser decodificado e a assinatura verificada.
   * O valor retornado será anexado a `request.user`.
   * @param payload O payload decodificado do JWT.
   * @returns O objeto ISessao (que é o payload) se o token for válido.
   */
  validate(payload: ISessao): ISessao {
    this.logger.verbose(
      `Validando payload JWT (common): sub=${payload.sub}, email=${payload.email}`,
    );

    if (!payload || !payload.sub || !payload.email) {
      this.logger.warn(
        'Token JWT inválido: payload ausente ou campos essenciais (sub, email) faltando.',
      );
      throw new UnauthorizedException('Token inválido ou malformado.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
    } as ISessao;
  }
}

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CoreConfigService } from '@app/core-config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioEntity } from '@app/database/entities';
import { ISessao } from '@app/common/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly coreConfigService: CoreConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: coreConfigService.jwtSecret,
    });
    this.logger.log('JwtStrategy inicializada.');
  }

  /**
   * @param payload O payload decodificado do JWT.
   */
  async validate(payload: ISessao): Promise<ISessao> {
    this.logger.verbose(
      `Validando payload JWT para usuário ID: ${payload.sub}`,
    );

    const { sub: usuarioId } = payload;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      this.logger.warn(
        `Usuário do token JWT não encontrado ou inativo: ID ${usuarioId}`,
      );
      throw new UnauthorizedException(
        'Token inválido ou usuário não autorizado.',
      );
    }

    return { sub: usuario.id, email: usuario.email };
  }
}

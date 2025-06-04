import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { IsNull, Repository } from 'typeorm';
import { CoreConfigService } from '@app/core-config';
import { GeradorDeCodigoService } from './gerador-de-codigo/gerador-de-codigo.service';
import { EncurtarUrlDto, UrlEncurtadaRespostaDto } from './dtos';

@Injectable()
export class EncurtadorUrlService {
  private readonly logger = new Logger(EncurtadorUrlService.name);
  private readonly baseUrlAplicacao: string;

  constructor(
    @InjectRepository(UrlEncurtadaEntity)
    private readonly urlEncurtadaRepository: Repository<UrlEncurtadaEntity>,
    private readonly geradorDeCodigoService: GeradorDeCodigoService,
    private readonly coreConfigService: CoreConfigService,
  ) {
    const port = this.coreConfigService.portEncurtador;
    const nodeEnv = this.coreConfigService.nodeEnv;

    this.baseUrlAplicacao =
      nodeEnv === 'production'
        ? this.coreConfigService.baseUrlRedirecionar
        : `http://localhost:${port}`;
    this.logger.log(`Base URL para URLs encurtadas: ${this.baseUrlAplicacao}/`);
  }

  async encurtarUrl(
    encurtarUrlDto: EncurtarUrlDto,
    usuarioId?: string,
  ): Promise<UrlEncurtadaRespostaDto> {
    const { urlOriginal } = encurtarUrlDto;
    this.logger.log(
      `Requisição para encurtar URL: ${urlOriginal}${usuarioId ? ` pelo usuário ${usuarioId}` : ' (anônimo)'}`,
    );

    const urlJaExistente = await this.urlEncurtadaRepository.findOne({
      where: {
        urlOriginal,
        usuarioId: usuarioId || IsNull(),
      },
    });
    if (urlJaExistente) {
      this.logger.log(
        `URL ${urlOriginal} já encurtada anteriormente com código ${urlJaExistente.codigoCurto}. Reutilizando.`,
      );
      const urlEncurtadaCompleta = `${this.baseUrlAplicacao}/${urlJaExistente.codigoCurto}`;
      return {
        codigoCurto: urlJaExistente.codigoCurto,
        urlEncurtadaCompleta: urlEncurtadaCompleta,
        urlOriginal: urlJaExistente.urlOriginal,
      };
    }

    let codigoCurto: string;
    try {
      codigoCurto = await this.geradorDeCodigoService.gerarCodigoUnico();
    } catch (error: unknown) {
      this.logger.error(
        `Falha crítica ao tentar gerar código único para ${urlOriginal}: ${error?.['message']}`,
        error?.['stack'],
      );
      throw new InternalServerErrorException(
        'Não foi possível processar o encurtamento da URL no momento devido a um problema na geração de código.',
      );
    }

    const novaUrlEncurtada = this.urlEncurtadaRepository.create({
      urlOriginal,
      codigoCurto,
      cliques: 0,
      usuarioId: usuarioId || undefined,
    });

    try {
      const urlSalva = await this.urlEncurtadaRepository.save(novaUrlEncurtada);
      this.logger.log(
        `URL ${urlOriginal} encurtada para ${codigoCurto} (ID: ${urlSalva.id}) com sucesso.`,
      );

      const urlEncurtadaCompleta = `${this.baseUrlAplicacao}/api/r/${urlSalva.codigoCurto}`;

      return {
        codigoCurto: urlSalva.codigoCurto,
        urlEncurtadaCompleta: urlEncurtadaCompleta,
        urlOriginal: urlSalva.urlOriginal,
      };
    } catch (error: unknown) {
      if (
        error?.['code'] === '23505' &&
        (error?.['detail'] as string[]).includes('(codigo_curto)')
      ) {
        this.logger.error(
          `Erro de constraint UNIQUE ao salvar URL encurtada (colisão tardia de código): ${codigoCurto}. Detalhe: ${error?.['detail']}`,
          error?.['stack'],
        );
        throw new ConflictException(
          'Ocorreu um conflito ao tentar gerar o código para sua URL. Por favor, tente novamente.',
        );
      }
      this.logger.error(
        `Falha ao salvar URL encurtada no banco para ${urlOriginal} com código ${codigoCurto}`,
        error?.['stack'],
      );
      throw new InternalServerErrorException('Erro ao salvar a URL encurtada.');
    }
  }
}

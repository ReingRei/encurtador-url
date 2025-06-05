import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { Repository, IsNull } from 'typeorm';
import { CoreConfigService } from '@app/core-config';
import { MensagemRespostaDto } from '@app/common';
import {
  AtualizarUrlDto,
  ListarMinhasUrlsQueryDto,
  MinhasUrlsPaginadasRespostaDto,
  UrlEncurtadaDetalhesDto,
} from '../dtos';

@Injectable()
export class GerenciadorMinhasUrlsService {
  private readonly logger = new Logger(GerenciadorMinhasUrlsService.name);
  private readonly redirecionadorBaseUrl: string;

  constructor(
    @InjectRepository(UrlEncurtadaEntity)
    private readonly urlEncurtadaRepository: Repository<UrlEncurtadaEntity>,
    private readonly coreConfigService: CoreConfigService,
  ) {
    const nodeEnv = this.coreConfigService.nodeEnv;
    this.redirecionadorBaseUrl =
      this.coreConfigService.baseUrlRedirecionar ||
      (nodeEnv === 'production'
        ? 'https://seu.dominio.para.redirecionar.com'
        : `http://localhost:${this.coreConfigService.portEncurtador || 3003}`);
  }

  private construirUrlCompleta(codigoCurto: string): string {
    return `${this.redirecionadorBaseUrl}/${codigoCurto}`;
  }

  private paraDetalhesDto(
    entity: UrlEncurtadaEntity,
  ): UrlEncurtadaDetalhesDto | null {
    if (!entity) return null;
    return {
      id: entity.id,
      urlOriginal: entity.urlOriginal,
      codigoCurto: entity.codigoCurto,
      urlEncurtadaCompleta: this.construirUrlCompleta(entity.codigoCurto),
      cliques: entity.cliques,
      dataCriacao: entity.dataCriacao,
      dataAtualizacao: entity.dataAtualizacao,
    } as UrlEncurtadaDetalhesDto;
  }

  async listarPaginado(
    usuarioId: string,
    queryDto: ListarMinhasUrlsQueryDto,
  ): Promise<MinhasUrlsPaginadasRespostaDto> {
    this.logger.log(
      `Listando URLs para usuário ID: ${usuarioId} com paginação: ${JSON.stringify(queryDto)}`,
    );
    const { pagina, limite } = queryDto;
    const skip = (pagina - 1) * limite;

    const [urls, totalItens] = await this.urlEncurtadaRepository.findAndCount({
      where: { usuarioId, dataExclusao: IsNull() },
      order: { dataCriacao: 'DESC' },
      take: limite,
      skip: skip,
    });

    const totalPaginas = Math.ceil(totalItens / limite);

    return {
      dados: urls.map(this.paraDetalhesDto.bind(this)),
      totalItens,
      totalPaginas,
      paginaAtual: pagina,
      itensPorPagina: limite,
    };
  }

  async atualizarUrl(
    idUrl: string,
    usuarioId: string,
    dadosAtualizacao: AtualizarUrlDto,
  ): Promise<UrlEncurtadaDetalhesDto | null> {
    this.logger.log(
      `Usuário ID: ${usuarioId} tentando atualizar URL ID: ${idUrl}`,
    );
    const urlEncontrada = await this.urlEncurtadaRepository.findOne({
      where: { id: idUrl, dataExclusao: IsNull() },
    });

    if (!urlEncontrada) {
      throw new NotFoundException(
        `URL encurtada com ID "${idUrl}" não encontrada.`,
      );
    }

    if (urlEncontrada.usuarioId !== usuarioId) {
      this.logger.warn(
        `Usuário ID: ${usuarioId} tentou atualizar URL ID: ${idUrl} que não lhe pertence.`,
      );
      throw new ForbiddenException(
        'Você não tem permissão para modificar esta URL.',
      );
    }

    urlEncontrada.urlOriginal = dadosAtualizacao.urlOriginal;

    try {
      const urlAtualizada =
        await this.urlEncurtadaRepository.save(urlEncontrada);
      this.logger.log(
        `URL ID: ${idUrl} atualizada com sucesso pelo usuário ID: ${usuarioId}`,
      );
      return this.paraDetalhesDto(urlAtualizada);
    } catch (error: unknown) {
      let errorStack: string | undefined;
      if (error instanceof Error) {
        errorStack = error.stack;
      }
      this.logger.error(
        `Falha ao atualizar URL ID: ${idUrl} no banco.`,
        errorStack,
      );
      throw new InternalServerErrorException(
        'Erro ao atualizar a URL encurtada.',
      );
    }
  }

  async deletarUrl(
    idUrl: string,
    usuarioId: string,
  ): Promise<MensagemRespostaDto> {
    this.logger.log(
      `Usuário ID: ${usuarioId} tentando deletar URL ID: ${idUrl}`,
    );
    const urlEncontrada = await this.urlEncurtadaRepository.findOne({
      where: { id: idUrl, dataExclusao: IsNull() },
    });

    if (!urlEncontrada) {
      this.logger.warn(
        `Tentativa de deletar URL ID: ${idUrl} não encontrada ou já deletada, pelo usuário ID: ${usuarioId}`,
      );
      throw new NotFoundException(
        `URL encurtada com ID "${idUrl}" não encontrada.`,
      );
    }

    if (urlEncontrada.usuarioId !== usuarioId) {
      this.logger.warn(
        `Usuário ID: ${usuarioId} tentou deletar URL ID: ${idUrl} que não lhe pertence.`,
      );
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta URL.',
      );
    }

    try {
      await this.urlEncurtadaRepository.softDelete(idUrl);
      this.logger.log(
        `URL ID: ${idUrl} deletada logicamente com sucesso pelo usuário ID: ${usuarioId}`,
      );
      return { mensagem: 'URL encurtada deletada com sucesso.' };
    } catch (error: unknown) {
      let errorStack: string | undefined;
      if (error instanceof Error) {
        errorStack = error.stack;
      }
      this.logger.error(
        `Falha ao deletar URL ID: ${idUrl} no banco.`,
        errorStack,
      );
      throw new InternalServerErrorException(
        'Erro ao deletar a URL encurtada.',
      );
    }
  }
}

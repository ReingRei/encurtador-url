import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';

@Injectable()
export class GeradorDeCodigoService {
  private readonly logger = new Logger(GeradorDeCodigoService.name);
  private readonly TAMANHO_CODIGO = 6;
  private readonly MAX_TENTATIVAS_GERACAO = 5;

  constructor(
    @InjectRepository(UrlEncurtadaEntity)
    private readonly urlEncurtadaRepository: Repository<UrlEncurtadaEntity>,
  ) {}

  /**
   * Gera um código curto alfanumérico único.
   * Tenta gerar um código e verifica sua unicidade no banco.
   * Repete um número limitado de vezes se houver colisão.
   * @returns Uma Promise com o código curto único.
   * @throws Error se não conseguir gerar um código único após MAX_TENTATIVAS_GERACAO.
   */
  async gerarCodigoUnico(): Promise<string> {
    for (let i = 0; i < this.MAX_TENTATIVAS_GERACAO; i++) {
      const codigo = nanoid(this.TAMANHO_CODIGO); 
      this.logger.debug(`Tentativa ${i + 1}: Código gerado - ${codigo}`);

      const existente = await this.urlEncurtadaRepository.findOne({
        where: { codigoCurto: codigo },
      });

      if (!existente) {
        this.logger.log(`Código único gerado com sucesso: ${codigo}`);
        return codigo;
      }
      this.logger.warn(
        `Colisão de código detectada para: ${codigo}. Tentando novamente.`,
      );
    }

    this.logger.error(
      `Não foi possível gerar um código curto único após ${this.MAX_TENTATIVAS_GERACAO} tentativas.`,
    );
    
    throw new Error(
      'Não foi possível gerar um código curto único. Por favor, tente novamente.',
    );
  }
}

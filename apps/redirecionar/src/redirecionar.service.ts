import { UrlEncurtadaEntity } from '@app/database/entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RedirecionarService {
  private readonly logger = new Logger(RedirecionarService.name);

  constructor(
    @InjectRepository(UrlEncurtadaEntity)
    private readonly urlRepository: Repository<UrlEncurtadaEntity>,
  ) {}

  async processarRedirecionamento(codigoCurto: string): Promise<string> {
    this.logger.log(`Recuperando URL para redirecionamento: ${codigoCurto}`);
    const urlEncontrada = await this.urlRepository.findOne({
      where: {
        codigoCurto: codigoCurto,
      },
    });

    if (!urlEncontrada) {
      throw new NotFoundException(
        `URL com código '${codigoCurto}' não encontrada ou está inativa.`,
      );
    }

    await this.urlRepository.increment({ id: urlEncontrada.id }, 'cliques', 1);

    return urlEncontrada.urlOriginal;
  }
}

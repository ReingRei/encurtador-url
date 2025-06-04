import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GerenciadorDeSenhaService {
  private readonly logger = new Logger(GerenciadorDeSenhaService.name);
  private readonly saltRounds = 10;

  async gerarHash(senha: string): Promise<string> {
    try {
      return await bcrypt.hash(senha, this.saltRounds);
    } catch (error: unknown) {
      this.logger.error('Falha ao gerar hash da senha', error?.['stack']);
      throw new InternalServerErrorException(
        'Erro interno ao processar a senha.',
      );
    }
  }

  async compararSenhas(
    senhaFornecida: string,
    hashArmazenado: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(senhaFornecida, hashArmazenado);
    } catch (error: unknown) {
      this.logger.error('Falha ao comparar senhas', error?.['stack']);
      throw new InternalServerErrorException(
        'Erro interno ao verificar a senha.',
      );
    }
  }
}

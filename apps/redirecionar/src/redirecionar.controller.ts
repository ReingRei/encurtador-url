import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { RedirecionarService } from './redirecionar.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Redirecionar')
@Controller()
export class RedirecionarController {
  private readonly logger = new Logger(RedirecionarController.name);

  constructor(private readonly redirecionarService: RedirecionarService) {}

  @Get(':codigoCurto')
  @ApiOperation({
    summary: 'Redireciona para a URL original de um código curto.',
    description:
      'Recebe um código curto, busca a URL original correspondente, contabiliza o acesso e redireciona o usuário.',
  })
  @ApiParam({
    name: 'codigoCurto',
    required: true,
    description: 'O código de 6 caracteres da URL encurtada.',
    example: 'aZbKq7',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento para a URL original bem-sucedido.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'URL não encontrada ou código curto inválido.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Formato do código curto inválido.',
  })
  async redirecionar(
    @Param('codigoCurto') codigoCurto: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(
      `Recebida requisição de redirecionar para o código: ${codigoCurto}`,
    );
    if (!codigoCurto || codigoCurto.length !== 6) {
      throw new BadRequestException(
        'O código curto deve ter exatamente 6 caracteres.',
      );
    }

    try {
      const urlOriginal =
        await this.redirecionarService.processarRedirecionamento(codigoCurto);
      res.redirect(HttpStatus.FOUND, urlOriginal);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      this.logger.error(
        `Erro inesperado durante o redirecionamento para o código: ${codigoCurto}`,
        error,
      );
      throw new BadRequestException(
        'Não foi possível processar sua solicitação de redirecionamento.',
      );
    }
  }
}

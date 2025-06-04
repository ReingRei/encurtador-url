import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EncurtadorUrlService } from './encurtador-url.service';
import { EncurtarUrlDto } from './dtos/encurtar-url.dto';
import { UrlEncurtadaRespostaDto } from './dtos/url-encurtada-resposta.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

@ApiTags('encurtador')
@Controller()
export class EncurtadorUrlController {
  private readonly logger = new Logger(EncurtadorUrlController.name);

  constructor(private readonly encurtadorUrlService: EncurtadorUrlService) {}

  @Post('encurtador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria uma nova URL encurtada.',
    description: 'Recebe uma URL original e retorna uma versão encurtada dela.',
  })
  @ApiBody({
    type: EncurtarUrlDto,
    description: 'Dados necessários para encurtar a URL.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'URL encurtada com sucesso.',
    type: UrlEncurtadaRespostaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos (ex: URL mal formatada).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflito ao gerar o código curto (raro, tente novamente).',
  })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas. Tente novamente mais tarde.'})
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor ao processar a solicitação.',
  })
  async encurtar(
    @Body() encurtarUrlDto: EncurtarUrlDto,
  ): Promise<UrlEncurtadaRespostaDto> {
    this.logger.log(
      `Requisição para encurtar URL: ${encurtarUrlDto.urlOriginal}`,
    );
    return this.encurtadorUrlService.encurtarUrl(encurtarUrlDto);
  }
}

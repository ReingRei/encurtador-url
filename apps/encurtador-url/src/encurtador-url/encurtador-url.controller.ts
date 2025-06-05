import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  UseGuards,
  Request,
  Query,
  Patch,
  ParseUUIDPipe,
  Param,
  Delete,
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
  ApiBearerAuth,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  AtualizarUrlDto,
  ListarMinhasUrlsQueryDto,
  MinhasUrlsPaginadasRespostaDto,
  UrlEncurtadaDetalhesDto,
} from './dtos';
import { ISessao, MensagemRespostaDto, OptionalAuthGuard } from '@app/common';
import { GerenciadorMinhasUrlsService } from './gerenciador-minhas-urls/gerenciador-minhas-urls.service';

interface RequestAutenticado {
  user: ISessao;
}
interface RequestOpcionalmenteAutenticado {
  user?: ISessao;
}
@ApiTags('Encurtador')
@Controller()
export class EncurtadorUrlController {
  private readonly logger = new Logger(EncurtadorUrlController.name);

  constructor(
    private readonly encurtadorUrlService: EncurtadorUrlService,
    private readonly gerenciadorMinhasUrlsService: GerenciadorMinhasUrlsService,
  ) {}
  @Get()
  recupera() {
    return 'ok';
  }

  @Post('encurtador')
  @UseGuards(OptionalAuthGuard)
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
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor ao processar a solicitação.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Não autorizado (se o token for inválido e a rota exigir autenticação opcionalmente).',
  })
  @ApiBearerAuth('access-token')
  async encurtar(
    @Body() encurtarUrlDto: EncurtarUrlDto,
    @Request() request: RequestOpcionalmenteAutenticado,
  ): Promise<UrlEncurtadaRespostaDto> {
    this.logger.log(
      `Requisição para encurtar URL: ${encurtarUrlDto.urlOriginal}`,
    );
    return this.encurtadorUrlService.encurtarUrl(
      encurtarUrlDto,
      request?.user?.sub,
    );
  }

  @Get('minhas-urls')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lista as URLs encurtadas pelo utilizador autenticado (paginado).',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número da página (padrão 1).',
    example: 1,
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Itens por página (padrão 10, máx 100).',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de URLs retornada com sucesso.',
    type: MinhasUrlsPaginadasRespostaDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. Token JWT inválido ou ausente.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  async listarMinhasUrls(
    @Request() req: RequestAutenticado,
    @Query() queryDto: ListarMinhasUrlsQueryDto,
  ): Promise<MinhasUrlsPaginadasRespostaDto> {
    this.logger.log(
      `Utilizador ID: ${req.user.sub} listando as suas URLs com query: ${JSON.stringify(queryDto)}`,
    );
    return this.gerenciadorMinhasUrlsService.listarPaginado(
      req.user.sub,
      queryDto,
    );
  }

  @Patch(':idUrl')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Atualiza a URL original de uma URL encurtada pertencente ao utilizador.',
  })
  @ApiParam({
    name: 'idUrl',
    description: 'ID da URL encurtada a ser atualizada (UUID).',
    type: String,
    example: '0c1c0b8e-4b8e-4b8e-8b8e-0c1c0b8e4b8e',
  })
  @ApiBody({ type: AtualizarUrlDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL atualizada com sucesso.',
    type: UrlEncurtadaDetalhesDto,
  })
  @ApiNotFoundResponse({ description: 'URL encurtada não encontrada.' })
  @ApiForbiddenResponse({
    description: 'Acesso negado. O utilizador não é proprietário da URL.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. Token JWT inválido ou ausente.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  async atualizarMinhaUrl(
    @Param('idUrl', ParseUUIDPipe) idUrl: string,
    @Request() req: RequestAutenticado,
    @Body() atualizarUrlDto: AtualizarUrlDto,
  ): Promise<UrlEncurtadaDetalhesDto | null> {
    this.logger.log(
      `Utilizador ID: ${req.user.sub} atualizando URL ID: ${idUrl}`,
    );
    return this.gerenciadorMinhasUrlsService.atualizarUrl(
      idUrl,
      req.user.sub,
      atualizarUrlDto,
    );
  }

  @Delete(':idUrl')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Elimina (logicamente) uma URL encurtada pertencente ao utilizador.',
  })
  @ApiParam({
    name: 'idUrl',
    description: 'ID da URL encurtada a ser eliminada (UUID).',
    type: String,
    example: '0c1c0b8e-4b8e-4b8e-8b8e-0c1c0b8e4b8e',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL eliminada com sucesso.',
    type: MensagemRespostaDto,
  })
  @ApiNotFoundResponse({ description: 'URL encurtada não encontrada.' })
  @ApiForbiddenResponse({
    description: 'Acesso negado. O utilizador não é proprietário da URL.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. Token JWT inválido ou ausente.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas. Tente novamente mais tarde.',
  })
  async deletarMinhaUrl(
    @Param('idUrl', ParseUUIDPipe) idUrl: string,
    @Request() req: RequestAutenticado,
  ): Promise<MensagemRespostaDto> {
    this.logger.log(
      `Utilizador ID: ${req.user.sub} eliminando URL ID: ${idUrl}`,
    );
    return this.gerenciadorMinhasUrlsService.deletarUrl(idUrl, req.user.sub);
  }
}

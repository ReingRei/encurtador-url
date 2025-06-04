import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUsuarioDto, RegistrarUsuarioDto } from './dtos';
import { LoginResponseDto } from './dtos/login-response.dto';
import { ISessao, MensagemRespostaDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AutenticacaoController {
  private readonly logger = new Logger(AutenticacaoController.name);

  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar um novo usuário no sistema.' })
  @ApiBody({
    type: RegistrarUsuarioDto,
    description: 'Dados para o registro do novo usuário.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário registrado com sucesso.',
    type: MensagemRespostaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'E-mail já cadastrado.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor.',
  })
  async registrar(
    @Body() registrarUsuarioDto: RegistrarUsuarioDto,
  ): Promise<MensagemRespostaDto> {
    this.logger.log(
      `Recebida requisição de registro para o e-mail: ${registrarUsuarioDto.email}`,
    );
    return this.autenticacaoService.registrar(registrarUsuarioDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar um usuário e obter um token JWT.' })
  @ApiBody({ type: LoginUsuarioDto, description: 'Credenciais para login.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login bem-sucedido.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor.',
  })
  async login(
    @Body() loginUsuarioDto: LoginUsuarioDto,
  ): Promise<LoginResponseDto> {
    this.logger.log(
      `Recebida requisição de login para o e-mail: ${loginUsuarioDto.email}`,
    );
    return this.autenticacaoService.login(loginUsuarioDto);
  }

  @Get('perfil')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obter dados do perfil do usuário autenticado.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do perfil retornados com sucesso.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado. Token JWT inválido ou ausente.',
  })
  async obterPerfil(@Request() req): Promise<any> {
    this.logger.log(`Usuário ${req.user.email} acessando perfil.`);
    return req.user;
  }
}

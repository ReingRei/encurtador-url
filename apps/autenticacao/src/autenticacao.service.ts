import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '@app/database/entities/usuario.entity';
import { LoginUsuarioDto, RegistrarUsuarioDto } from './dtos';
import { GerenciadorDeSenhaService } from './gerenciador-de-senha/gerenciador-de-senha.service';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dtos/login-response.dto';
import { ISessao, MensagemRespostaDto } from '@app/common';

@Injectable()
export class AutenticacaoService {
  private readonly logger = new Logger(AutenticacaoService.name);

  constructor(
    @InjectRepository(UsuarioEntity)
    private usuarioRepository: Repository<UsuarioEntity>,
    private gerenciadorDeSenhaService: GerenciadorDeSenhaService,
    private jwtService: JwtService,
  ) {}

  async registrar(
    registrarUsuarioDto: RegistrarUsuarioDto,
  ): Promise<MensagemRespostaDto> {
    const { nome, email, senha } = registrarUsuarioDto;

    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { email },
    });
    if (usuarioExistente) {
      this.logger.warn(
        `Tentativa de registro com e-mail já existente: ${email}`,
      );
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const senhaHasheada = await this.gerenciadorDeSenhaService.gerarHash(senha);

    const novoUsuario = this.usuarioRepository.create({
      nome,
      email,
      senha: senhaHasheada,
    });

    try {
      await this.usuarioRepository.save(novoUsuario);
      this.logger.log(`Usuário criado com sucesso.: ${email}`);

      return {
        mensagem: "Usuário criado com sucesso.",
      };
    } catch (error) {
      this.logger.error(
        `Falha ao salvar usuário no banco: ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao registrar usuário.');
    }
  }

  async login(loginUsuarioDto: LoginUsuarioDto): Promise<LoginResponseDto> {
    const { email, senha } = loginUsuarioDto;
    this.logger.log(`Tentativa de login para o e-mail: ${email}`);

    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      select: { id: true, email: true, senha: true },
      withDeleted: false,
    });

    if (!usuario) {
      this.logger.warn(
        `Tentativa de login falhou: Usuário não encontrado - ${email}`,
      );
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaCorreta = await this.gerenciadorDeSenhaService.compararSenhas(
      senha,
      usuario.senha,
    );

    if (!senhaCorreta) {
      this.logger.warn(`Tentativa de login falhou: Senha incorreta - ${email}`);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload: ISessao = { email: usuario.email, sub: usuario.id };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login bem-sucedido para o e-mail: ${email}`);
    return { accessToken };
  }
}

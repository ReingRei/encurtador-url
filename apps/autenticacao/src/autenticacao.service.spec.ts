import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoService } from './autenticacao.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuarioEntity } from '@app/database/entities/usuario.entity';
import { GerenciadorDeSenhaService } from './gerenciador-de-senha/gerenciador-de-senha.service';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MensagemRespostaDto } from '@app/common';
import { LoginUsuarioDto, RegistrarUsuarioDto } from './dtos';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGerenciadorDeSenhaService = {
    gerarHash: jest.fn(),
    compararSenhas: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoService,
        Logger,
        {
          provide: getRepositoryToken(UsuarioEntity),
          useValue: mockUsuarioRepository,
        },
        {
          provide: GerenciadorDeSenhaService,
          useValue: mockGerenciadorDeSenhaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AutenticacaoService>(AutenticacaoService);
  });

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registrar', () => {
    let registrarUsuarioDto: RegistrarUsuarioDto;
    let usuarioMockParaSalvar: Partial<UsuarioEntity>;
    const senhaHasheadaMock = 'senhaHasheadaComSucessoPeloServico';

    beforeEach(() => {
      registrarUsuarioDto = {
        nome: 'Teste SRP Usuario',
        email: 'testesrp@example.com',
        senha: 'passwordSRP123',
      };
      usuarioMockParaSalvar = {
        nome: registrarUsuarioDto.nome,
        email: registrarUsuarioDto.email,
        senha: senhaHasheadaMock,
      };
    });

    it('deve registrar um novo usuário e retornar mensagem de sucesso', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockGerenciadorDeSenhaService.gerarHash.mockResolvedValue(
        senhaHasheadaMock,
      );
      mockUsuarioRepository.create.mockReturnValue(
        usuarioMockParaSalvar as UsuarioEntity,
      );
      mockUsuarioRepository.save.mockResolvedValue({
        ...usuarioMockParaSalvar,
        id: 'uuid-gerado',
      } as UsuarioEntity);

      const expectedResult: MensagemRespostaDto = {
        mensagem: 'Usuário criado com sucesso.',
      };
      const result = await service.registrar(registrarUsuarioDto);

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: registrarUsuarioDto.email },
        }),
      );
      expect(mockGerenciadorDeSenhaService.gerarHash).toHaveBeenCalledWith(
        registrarUsuarioDto.senha,
      );
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        nome: registrarUsuarioDto.nome,
        email: registrarUsuarioDto.email,
        senha: senhaHasheadaMock,
      });
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
        usuarioMockParaSalvar,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue({
        id: 'existente-uuid',
      } as UsuarioEntity);

      await expect(service.registrar(registrarUsuarioDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: registrarUsuarioDto.email },
        }),
      );
      expect(mockGerenciadorDeSenhaService.gerarHash).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se GerenciadorDeSenhaService.gerarHash falhar', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      const erroSimulado = new InternalServerErrorException(
        'Erro interno ao processar a senha.',
      );
      mockGerenciadorDeSenhaService.gerarHash.mockRejectedValue(erroSimulado);

      await expect(service.registrar(registrarUsuarioDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockGerenciadorDeSenhaService.gerarHash).toHaveBeenCalledWith(
        registrarUsuarioDto.senha,
      );
    });

    it('deve lançar InternalServerErrorException se salvar no banco falhar', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockGerenciadorDeSenhaService.gerarHash.mockResolvedValue(
        senhaHasheadaMock,
      );
      mockUsuarioRepository.create.mockReturnValue(
        usuarioMockParaSalvar as UsuarioEntity,
      );
      const erroSimulado = new Error('Falha no banco');
      mockUsuarioRepository.save.mockRejectedValue(erroSimulado);

      await expect(service.registrar(registrarUsuarioDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    let loginUsuarioDto: LoginUsuarioDto;
    let usuarioSalvoMock: UsuarioEntity;
    const accessTokenMock = 'mockAccessToken';

    beforeEach(() => {
      loginUsuarioDto = {
        email: 'usuario.existente@example.com',
        senha: 'senhaCorreta123',
      };

      usuarioSalvoMock = {
        id: 'uuid-existente-123',
        nome: 'Usuário Existente',
        email: loginUsuarioDto.email,
        senha: 'senhaHasheadaCorretamenteNoBanco',
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        dataExclusao: null,
        urlsEncurtadas: [],
      };
    });

    it('deve autenticar o usuário e retornar um accessToken com sucesso', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioSalvoMock);
      mockGerenciadorDeSenhaService.compararSenhas.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessTokenMock);

      const resultado = await service.login(loginUsuarioDto);

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: loginUsuarioDto.email },
          select: { id: true, email: true, senha: true },
          withDeleted: false,
        }),
      );
      expect(mockGerenciadorDeSenhaService.compararSenhas).toHaveBeenCalledWith(
        loginUsuarioDto.senha,
        usuarioSalvoMock.senha,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: usuarioSalvoMock.email,
        sub: usuarioSalvoMock.id,
      });
      expect(resultado).toEqual({ accessToken: accessTokenMock });
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginUsuarioDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: loginUsuarioDto.email },
          select: { id: true, email: true, senha: true },
          withDeleted: false,
        }),
      );
      expect(
        mockGerenciadorDeSenhaService.compararSenhas,
      ).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioSalvoMock);
      mockGerenciadorDeSenhaService.compararSenhas.mockResolvedValue(false);

      await expect(service.login(loginUsuarioDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: loginUsuarioDto.email },
          select: { id: true, email: true, senha: true },
          withDeleted: false,
        }),
      );
      expect(mockGerenciadorDeSenhaService.compararSenhas).toHaveBeenCalledWith(
        loginUsuarioDto.senha,
        usuarioSalvoMock.senha,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se gerenciadorDeSenhaService.compararSenhas falhar', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioSalvoMock);
      mockGerenciadorDeSenhaService.compararSenhas.mockRejectedValue(
        new InternalServerErrorException(
          'Simulação de falha interna ao comparar senhas',
        ),
      );

      await expect(service.login(loginUsuarioDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

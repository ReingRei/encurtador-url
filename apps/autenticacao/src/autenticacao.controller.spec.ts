import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { LoginUsuarioDto, RegistrarUsuarioDto } from './dtos';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MensagemRespostaDto } from '@app/common';

describe('AutenticacaoController', () => {
  let controller: AutenticacaoController;
  let service: AutenticacaoService;

  const mockAutenticacaoService = {
    registrar: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticacaoController],
      providers: [
        {
          provide: AutenticacaoService,
          useValue: mockAutenticacaoService,
        },
      ],
    }).compile();

    controller = module.get<AutenticacaoController>(AutenticacaoController);
    service = module.get<AutenticacaoService>(AutenticacaoService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('registrar', () => {
    it('deve chamar autenticacaoService.registrar e retornar o resultado', async () => {
      const registrarDto: RegistrarUsuarioDto = {
        nome: 'Usuário Teste',
        email: 'teste@example.com',
        senha: 'password123',
      };
      const resultadoEsperado: MensagemRespostaDto = {
        mensagem: 'Usuário criado com sucesso.',
      };

      mockAutenticacaoService.registrar.mockResolvedValue(resultadoEsperado);

      const resultado = await controller.registrar(registrarDto);

      expect(service.registrar).toHaveBeenCalledWith(registrarDto);
      expect(resultado).toEqual(resultadoEsperado);
    });

    it('deve logar a requisição de registro', async () => {
      const registrarDto: RegistrarUsuarioDto = {
        nome: 'Usuário Teste Log',
        email: 'testelog@example.com',
        senha: 'password123log',
      };
      const loggerSpy = jest.spyOn(controller['logger'], 'log');

      mockAutenticacaoService.registrar.mockResolvedValue({ mensagem: 'OK' });

      await controller.registrar(registrarDto);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Recebida requisição de registro para o e-mail: ${registrarDto.email}`,
      );
      loggerSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('deve chamar autenticacaoService.login e retornar o resultado', async () => {
      const loginDto: LoginUsuarioDto = {
        email: 'teste@example.com',
        senha: 'password123',
      };
      const resultadoEsperado: LoginResponseDto = {
        accessToken: 'mockAccessToken',
      };

      mockAutenticacaoService.login.mockResolvedValue(resultadoEsperado);

      const resultado = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(resultado).toEqual(resultadoEsperado);
    });

    it('deve logar a requisição de login', async () => {
      const loginDto: LoginUsuarioDto = {
        email: 'testelogin@example.com',
        senha: 'passwordlogin123',
      };
      const loggerSpy = jest.spyOn(controller['logger'], 'log');

      mockAutenticacaoService.login.mockResolvedValue({ accessToken: 'token' });

      await controller.login(loginDto);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Recebida requisição de login para o e-mail: ${loginDto.email}`,
      );
      loggerSpy.mockRestore();
    });
  });
});

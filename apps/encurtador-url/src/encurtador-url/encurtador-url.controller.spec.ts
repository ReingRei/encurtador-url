/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EncurtadorUrlController } from './encurtador-url.controller';
import { EncurtadorUrlService } from './encurtador-url.service';
import { GerenciadorMinhasUrlsService } from './gerenciador-minhas-urls/gerenciador-minhas-urls.service';
import { MensagemRespostaDto, ISessao, OptionalAuthGuard } from '@app/common';
import { Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AtualizarUrlDto,
  EncurtarUrlDto,
  ListarMinhasUrlsQueryDto,
  MinhasUrlsPaginadasRespostaDto,
  UrlEncurtadaDetalhesDto,
  UrlEncurtadaRespostaDto,
} from './dtos';

interface RequestAutenticadoMock {
  user: ISessao;
}
interface RequestOpcionalmenteAutenticadoMock {
  user?: ISessao;
}

describe('EncurtadorUrlController', () => {
  let controller: EncurtadorUrlController;
  let encurtadorUrlService: EncurtadorUrlService;
  let gerenciadorMinhasUrlsService: GerenciadorMinhasUrlsService;
  let loggerSpy: jest.SpyInstance;

  const mockEncurtadorUrlService = {
    encurtarUrl: jest.fn(),
  };

  const mockGerenciadorMinhasUrlsService = {
    listarPaginado: jest.fn(),
    atualizarUrl: jest.fn(),
    deletarUrl: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };
  const mockOptionalAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUser: ISessao = {
    sub: 'user-test-id-123',
    email: 'teste@example.com',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncurtadorUrlController],
      providers: [
        {
          provide: EncurtadorUrlService,
          useValue: mockEncurtadorUrlService,
        },
        {
          provide: GerenciadorMinhasUrlsService,
          useValue: mockGerenciadorMinhasUrlsService,
        },
        Logger,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(OptionalAuthGuard)
      .useValue(mockOptionalAuthGuard)
      .compile();

    controller = module.get<EncurtadorUrlController>(EncurtadorUrlController);
    encurtadorUrlService =
      module.get<EncurtadorUrlService>(EncurtadorUrlService);
    gerenciadorMinhasUrlsService = module.get<GerenciadorMinhasUrlsService>(
      GerenciadorMinhasUrlsService,
    );
    loggerSpy = jest.spyOn(controller['logger'], 'log').mockImplementation();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('recupera', () => {
    it('deve retornar "ok"', () => {
      expect(controller.recupera()).toBe('ok');
    });
  });

  describe('encurtar', () => {
    const encurtarDto: EncurtarUrlDto = {
      urlOriginal: 'https://muitourllonga.com',
    };
    const respostaEsperada: UrlEncurtadaRespostaDto = {
      codigoCurto: 'abc12',
      urlEncurtadaCompleta: 'http://localhost/abc12',
      urlOriginal: encurtarDto.urlOriginal,
    };

    it('deve chamar encurtadorUrlService.encurtarUrl com usuarioId se autenticado', async () => {
      mockEncurtadorUrlService.encurtarUrl.mockResolvedValue(respostaEsperada);
      const mockRequest: RequestOpcionalmenteAutenticadoMock = {
        user: mockUser,
      };

      const resultado = await controller.encurtar(encurtarDto, mockRequest);

      expect(encurtadorUrlService.encurtarUrl).toHaveBeenCalledWith(
        encurtarDto,
        mockUser.sub,
      );
      expect(resultado).toEqual(respostaEsperada);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Requisição para encurtar URL: ${encurtarDto.urlOriginal}`,
      );
    });

    it('deve chamar encurtadorUrlService.encurtarUrl com undefined para usuarioId se anônimo', async () => {
      mockEncurtadorUrlService.encurtarUrl.mockResolvedValue(respostaEsperada);
      const mockRequest: RequestOpcionalmenteAutenticadoMock = {};

      const resultado = await controller.encurtar(encurtarDto, mockRequest);

      expect(encurtadorUrlService.encurtarUrl).toHaveBeenCalledWith(
        encurtarDto,
        undefined,
      );
      expect(resultado).toEqual(respostaEsperada);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Requisição para encurtar URL: ${encurtarDto.urlOriginal}`,
      );
    });
  });

  describe('listarMinhasUrls', () => {
    it('deve chamar gerenciadorMinhasUrlsService.listarPaginado e retornar o resultado', async () => {
      const queryDto: ListarMinhasUrlsQueryDto = { pagina: 1, limite: 5 };
      const resultadoEsperado: MinhasUrlsPaginadasRespostaDto = {
        dados: [],
        totalItens: 0,
        totalPaginas: 0,
        paginaAtual: 1,
        itensPorPagina: 5,
      };
      mockGerenciadorMinhasUrlsService.listarPaginado.mockResolvedValue(
        resultadoEsperado,
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };

      const resultado = await controller.listarMinhasUrls(
        mockRequest,
        queryDto,
      );

      expect(gerenciadorMinhasUrlsService.listarPaginado).toHaveBeenCalledWith(
        mockUser.sub,
        queryDto,
      );
      expect(resultado).toEqual(resultadoEsperado);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Utilizador ID: ${mockUser.sub} listando as suas URLs com query: ${JSON.stringify(queryDto)}`,
      );
    });
  });

  describe('atualizarMinhaUrl', () => {
    const idUrl = 'url-valida-uuid';
    const atualizarDto: AtualizarUrlDto = {
      urlOriginal: 'https://novodestino.com',
    };
    const urlDetalhesEsperada: UrlEncurtadaDetalhesDto = {
      id: idUrl,
      urlOriginal: atualizarDto.urlOriginal,
      codigoCurto: 'curto1',
      urlEncurtadaCompleta: 'http://localhost/curto1',
      cliques: 0,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    };

    it('deve chamar gerenciadorMinhasUrlsService.atualizarUrl e retornar o resultado', async () => {
      mockGerenciadorMinhasUrlsService.atualizarUrl.mockResolvedValue(
        urlDetalhesEsperada,
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };

      const resultado = await controller.atualizarMinhaUrl(
        idUrl,
        mockRequest,
        atualizarDto,
      );

      expect(gerenciadorMinhasUrlsService.atualizarUrl).toHaveBeenCalledWith(
        idUrl,
        mockUser.sub,
        atualizarDto,
      );
      expect(resultado).toEqual(urlDetalhesEsperada);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Utilizador ID: ${mockUser.sub} atualizando URL ID: ${idUrl}`,
      );
    });

    it('deve repassar NotFoundException do serviço', async () => {
      mockGerenciadorMinhasUrlsService.atualizarUrl.mockRejectedValue(
        new NotFoundException(),
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };
      await expect(
        controller.atualizarMinhaUrl(idUrl, mockRequest, atualizarDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar ForbiddenException do serviço', async () => {
      mockGerenciadorMinhasUrlsService.atualizarUrl.mockRejectedValue(
        new ForbiddenException(),
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };
      await expect(
        controller.atualizarMinhaUrl(idUrl, mockRequest, atualizarDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletarMinhaUrl', () => {
    const idUrl = 'url-para-deletar-uuid';
    const respostaEsperada: MensagemRespostaDto = {
      mensagem: 'URL encurtada deletada com sucesso.',
    };

    it('deve chamar gerenciadorMinhasUrlsService.deletarUrl e retornar o resultado', async () => {
      mockGerenciadorMinhasUrlsService.deletarUrl.mockResolvedValue(
        respostaEsperada,
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };

      const resultado = await controller.deletarMinhaUrl(idUrl, mockRequest);

      expect(gerenciadorMinhasUrlsService.deletarUrl).toHaveBeenCalledWith(
        idUrl,
        mockUser.sub,
      );
      expect(resultado).toEqual(respostaEsperada);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Utilizador ID: ${mockUser.sub} eliminando URL ID: ${idUrl}`,
      );
    });

    it('deve repassar NotFoundException do serviço', async () => {
      mockGerenciadorMinhasUrlsService.deletarUrl.mockRejectedValue(
        new NotFoundException(),
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };
      await expect(
        controller.deletarMinhaUrl(idUrl, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve repassar ForbiddenException do serviço', async () => {
      mockGerenciadorMinhasUrlsService.deletarUrl.mockRejectedValue(
        new ForbiddenException(),
      );
      const mockRequest: RequestAutenticadoMock = { user: mockUser };
      await expect(
        controller.deletarMinhaUrl(idUrl, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EncurtadorUrlService } from './encurtador-url.service';
import { CoreConfigService } from '@app/core-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { Repository, IsNull } from 'typeorm'; // Importar IsNull
import { EncurtarUrlDto } from './dtos/encurtar-url.dto';
import { UrlEncurtadaRespostaDto } from './dtos/url-encurtada-resposta.dto';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GeradorDeCodigoService } from './gerador-de-codigo/gerador-de-codigo.service';

describe('EncurtadorUrlService', () => {
  let service: EncurtadorUrlService;
  let urlEncurtadaRepository: Repository<UrlEncurtadaEntity>;
  let geradorDeCodigoService: GeradorDeCodigoService;

  const mockUrlEncurtadaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockGeradorDeCodigoService = {
    gerarCodigoUnico: jest.fn(),
  };

  // Este mock precisa fornecer a porta que seu serviço usa para construir a baseUrlAplicacao
  const mockCoreConfigService = {
    nodeEnv: 'test',
    portEncurtador: 3002, // Fornecendo a porta esperada pelo serviço
  };

  // beforeAll não é mais necessário para REDIRECTOR_BASE_URL se o serviço não o usa para esta URL
  // beforeAll(() => {
  //   process.env.REDIRECTOR_BASE_URL = REDIRECTOR_BASE_URL_MOCK;
  // });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncurtadorUrlService,
        Logger,
        {
          provide: getRepositoryToken(UrlEncurtadaEntity),
          useValue: mockUrlEncurtadaRepository,
        },
        {
          provide: GeradorDeCodigoService,
          useValue: mockGeradorDeCodigoService,
        },
        {
          provide: CoreConfigService,
          useValue: mockCoreConfigService,
        },
      ],
    }).compile();

    service = module.get<EncurtadorUrlService>(EncurtadorUrlService);
    urlEncurtadaRepository = module.get<Repository<UrlEncurtadaEntity>>(
      getRepositoryToken(UrlEncurtadaEntity),
    );
    geradorDeCodigoService = module.get<GeradorDeCodigoService>(
      GeradorDeCodigoService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('encurtarUrl', () => {
    let encurtarUrlDto: EncurtarUrlDto;
    const codigoGeradoMock = 'tst123';
    const usuarioIdMock = 'user-uuid-123';
    // A URL base esperada, construída como o serviço faz
    const baseUrlEsperada = `http://localhost:${mockCoreConfigService.portEncurtador}`;

    beforeEach(() => {
      encurtarUrlDto = {
        urlOriginal: 'https://www.muitourllonga.com/caminho/para/recurso',
      };
    });

    it('deve criar uma nova URL encurtada se ela não existir para o usuário (ou anônimo)', async () => {
      const urlSalvaMock = {
        id: 'uuid-teste',
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: null,
      } as unknown as UrlEncurtadaEntity;

      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService.gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository.create.mockReturnValue(urlSalvaMock);
      mockUrlEncurtadaRepository.save.mockResolvedValue(urlSalvaMock);

      // Ajusta a expectativa para corresponder à lógica do serviço
      const resultadoEsperado: UrlEncurtadaRespostaDto = {
        codigoCurto: codigoGeradoMock,
        urlEncurtadaCompleta: `${baseUrlEsperada}/api/r/${codigoGeradoMock}`,
        urlOriginal: encurtarUrlDto.urlOriginal,
      };

      // Teste para usuário anônimo
      let resultado = await service.encurtarUrl(encurtarUrlDto);

      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: IsNull(),
        },
      });
      expect(mockGeradorDeCodigoService.gerarCodigoUnico).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUrlEncurtadaRepository.create).toHaveBeenCalledWith({
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: undefined,
      });
      expect(mockUrlEncurtadaRepository.save).toHaveBeenCalledWith(
        urlSalvaMock,
      );
      expect(resultado).toEqual(resultadoEsperado);

      jest.clearAllMocks();

      // Teste para usuário autenticado
      const urlSalvaComUsuarioMock = {
        ...urlSalvaMock,
        usuarioId: usuarioIdMock,
      } as UrlEncurtadaEntity;
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService.gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository.create.mockReturnValue(urlSalvaComUsuarioMock);
      mockUrlEncurtadaRepository.save.mockResolvedValue(urlSalvaComUsuarioMock);

      resultado = await service.encurtarUrl(encurtarUrlDto, usuarioIdMock);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: usuarioIdMock,
        },
      });
      expect(mockGeradorDeCodigoService.gerarCodigoUnico).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUrlEncurtadaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: usuarioIdMock }),
      );
      expect(resultado).toEqual(resultadoEsperado); // A URL completa esperada é a mesma
    });

    it('deve reutilizar uma URL encurtada existente para o mesmo usuário (ou anônimo)', async () => {
      const urlExistenteMock = {
        id: 'uuid-existente',
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: 'exist1',
        cliques: 10,
        usuarioId: null,
      } as unknown as UrlEncurtadaEntity;

      mockUrlEncurtadaRepository.findOne.mockResolvedValue(urlExistenteMock);

      // Ajusta a expectativa para corresponder à lógica do serviço
      const resultadoEsperado: UrlEncurtadaRespostaDto = {
        codigoCurto: urlExistenteMock.codigoCurto,
        urlEncurtadaCompleta: `${baseUrlEsperada}/${urlExistenteMock.codigoCurto}`,
        urlOriginal: urlExistenteMock.urlOriginal,
      };

      const resultadoAnonimo = await service.encurtarUrl(encurtarUrlDto);

      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: IsNull(),
        },
      });
      expect(
        mockGeradorDeCodigoService.gerarCodigoUnico,
      ).not.toHaveBeenCalled();
      expect(mockUrlEncurtadaRepository.create).not.toHaveBeenCalled();
      expect(mockUrlEncurtadaRepository.save).not.toHaveBeenCalled();
      expect(resultadoAnonimo).toEqual(resultadoEsperado);

      jest.clearAllMocks();

      const urlExistenteComUsuarioMock = {
        ...urlExistenteMock,
        usuarioId: usuarioIdMock,
        codigoCurto: 'exist2',
      };
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(
        urlExistenteComUsuarioMock,
      );
      // Ajusta a expectativa para corresponder à lógica do serviço
      const resultadoEsperadoComUsuario: UrlEncurtadaRespostaDto = {
        codigoCurto: urlExistenteComUsuarioMock.codigoCurto,
        urlEncurtadaCompleta: `${baseUrlEsperada}/${urlExistenteComUsuarioMock.codigoCurto}`,
        urlOriginal: urlExistenteComUsuarioMock.urlOriginal,
      };

      const resultadoAutenticado = await service.encurtarUrl(
        encurtarUrlDto,
        usuarioIdMock,
      );
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: usuarioIdMock,
        },
      });
      expect(
        mockGeradorDeCodigoService.gerarCodigoUnico,
      ).not.toHaveBeenCalled();
      expect(resultadoAutenticado).toEqual(resultadoEsperadoComUsuario);
    });

    it('deve lançar InternalServerErrorException se gerarCodigoUnico falhar (quando a URL não existe)', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService.gerarCodigoUnico.mockRejectedValue(
        new Error('Falha crítica na geração'),
      );

      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar ConflictException se ocorrer colisão tardia de código ao salvar (quando a URL não existe)', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService.gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository.create.mockReturnValue(
        {} as UrlEncurtadaEntity,
      );
      const erroConstraint = {
        code: '23505',
        detail: 'Key (codigo_curto)=(tst123) already exists.',
      };
      mockUrlEncurtadaRepository.save.mockRejectedValue(erroConstraint);

      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros ao salvar (quando a URL não existe)', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService.gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository.create.mockReturnValue(
        {} as UrlEncurtadaEntity,
      );
      mockUrlEncurtadaRepository.save.mockRejectedValue(
        new Error('Outra falha no banco'),
      );

      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

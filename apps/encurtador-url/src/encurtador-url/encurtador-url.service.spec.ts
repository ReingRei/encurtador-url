import { Test, TestingModule } from '@nestjs/testing';
import { EncurtadorUrlService } from './encurtador-url.service';
import { GeradorDeCodigoService } from './gerador-de-codigo/gerador-de-codigo.service';
import { CoreConfigService } from '@app/core-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { IsNull } from 'typeorm';
import { EncurtarUrlDto } from './dtos';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

describe('EncurtadorUrlService', () => {
  let service: EncurtadorUrlService;
  let mockUrlEncurtadaRepository_findOne: jest.Mock;
  let mockUrlEncurtadaRepository_create: jest.Mock;
  let mockUrlEncurtadaRepository_save: jest.Mock;
  let mockGeradorDeCodigoService_gerarCodigoUnico: jest.Mock;

  const mockCoreConfigService = {
    nodeEnv: 'development',
    portEncurtador: 3003,
    baseUrlRedirecionar: 'https://url.curta.com',
  };

  beforeEach(async () => {
    mockUrlEncurtadaRepository_findOne = jest.fn();
    mockUrlEncurtadaRepository_create = jest.fn();
    mockUrlEncurtadaRepository_save = jest.fn();
    mockGeradorDeCodigoService_gerarCodigoUnico = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncurtadorUrlService,
        Logger,
        {
          provide: getRepositoryToken(UrlEncurtadaEntity),
          useValue: {
            findOne: mockUrlEncurtadaRepository_findOne,
            create: mockUrlEncurtadaRepository_create,
            save: mockUrlEncurtadaRepository_save,
          },
        },
        {
          provide: GeradorDeCodigoService,
          useValue: {
            gerarCodigoUnico: mockGeradorDeCodigoService_gerarCodigoUnico,
          },
        },
        {
          provide: CoreConfigService,
          useValue: mockCoreConfigService,
        },
      ],
    }).compile();

    service = module.get<EncurtadorUrlService>(EncurtadorUrlService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('encurtarUrl', () => {
    let encurtarUrlDto: EncurtarUrlDto;
    const codigoGeradoMock = 'genCod1';
    const usuarioIdMock = 'user-abc-123';

    const expectedBaseUrl =
      mockCoreConfigService.nodeEnv === 'production'
        ? mockCoreConfigService.baseUrlRedirecionar
        : `http://localhost:${mockCoreConfigService.portEncurtador}`;

    beforeEach(() => {
      encurtarUrlDto = {
        urlOriginal: 'https://www.exemplolongo.com/caminho/muito/grande',
      };
    });

    it('deve criar uma nova URL encurtada para utilizador anônimo se não existir', async () => {
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService_gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );

      const objetoCriadoSemUsuario = {
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: null,
      };
      mockUrlEncurtadaRepository_create.mockReturnValue(
        objetoCriadoSemUsuario as UrlEncurtadaEntity,
      );
      mockUrlEncurtadaRepository_save.mockResolvedValue({
        ...objetoCriadoSemUsuario,
        id: 'uuid1',
      } as UrlEncurtadaEntity);

      const resultado = await service.encurtarUrl(encurtarUrlDto);

      expect(mockUrlEncurtadaRepository_findOne).toHaveBeenCalledWith({
        where: { urlOriginal: encurtarUrlDto.urlOriginal, usuarioId: IsNull() },
      });
      expect(mockGeradorDeCodigoService_gerarCodigoUnico).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUrlEncurtadaRepository_create).toHaveBeenCalledWith({
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: undefined,
      });
      expect(mockUrlEncurtadaRepository_save).toHaveBeenCalledWith(
        objetoCriadoSemUsuario,
      );
      expect(resultado).toEqual({
        codigoCurto: codigoGeradoMock,
        urlEncurtadaCompleta: `${expectedBaseUrl}/api/r/${codigoGeradoMock}`,
        urlOriginal: encurtarUrlDto.urlOriginal,
      });
    });

    it('deve criar uma nova URL encurtada para utilizador autenticado se não existir', async () => {
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService_gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );

      const objetoCriadoSemUsuario = {
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: null,
      };
      const objetoParaSalvarComUsuario = {
        ...objetoCriadoSemUsuario,
        usuarioId: usuarioIdMock,
      };
      mockUrlEncurtadaRepository_create.mockReturnValue(
        objetoCriadoSemUsuario as UrlEncurtadaEntity,
      );
      mockUrlEncurtadaRepository_save.mockResolvedValue({
        ...objetoParaSalvarComUsuario,
        id: 'uuid2',
      } as UrlEncurtadaEntity);

      const resultado = await service.encurtarUrl(
        encurtarUrlDto,
        usuarioIdMock,
      );

      expect(mockUrlEncurtadaRepository_findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: usuarioIdMock,
        },
      });
      expect(mockGeradorDeCodigoService_gerarCodigoUnico).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUrlEncurtadaRepository_create).toHaveBeenCalledWith({
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: codigoGeradoMock,
        cliques: 0,
        usuarioId: undefined,
      });
      expect(mockUrlEncurtadaRepository_save).toHaveBeenCalledWith(
        expect.objectContaining(objetoParaSalvarComUsuario),
      );
      expect(resultado).toEqual({
        codigoCurto: codigoGeradoMock,
        urlEncurtadaCompleta: `${expectedBaseUrl}/api/r/${codigoGeradoMock}`,
        urlOriginal: encurtarUrlDto.urlOriginal,
      });
    });

    it('deve reutilizar URL existente para utilizador anônimo', async () => {
      const urlExistente = {
        id: 'uuid-existente-anon',
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: 'jaExst',
        cliques: 10,
        usuarioId: null,
      } as UrlEncurtadaEntity;
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(urlExistente);

      const resultado = await service.encurtarUrl(encurtarUrlDto);

      expect(mockUrlEncurtadaRepository_findOne).toHaveBeenCalledWith({
        where: { urlOriginal: encurtarUrlDto.urlOriginal, usuarioId: IsNull() },
      });
      expect(
        mockGeradorDeCodigoService_gerarCodigoUnico,
      ).not.toHaveBeenCalled();
      expect(mockUrlEncurtadaRepository_create).not.toHaveBeenCalled();
      expect(mockUrlEncurtadaRepository_save).not.toHaveBeenCalled();
      expect(resultado).toEqual({
        codigoCurto: urlExistente.codigoCurto,
        urlEncurtadaCompleta: `${expectedBaseUrl}/${urlExistente.codigoCurto}`,
        urlOriginal: urlExistente.urlOriginal,
      });
    });

    it('deve reutilizar URL existente para utilizador autenticado', async () => {
      const urlExistente = {
        id: 'uuid-existente-auth',
        urlOriginal: encurtarUrlDto.urlOriginal,
        codigoCurto: 'authExt',
        cliques: 5,
        usuarioId: usuarioIdMock,
      } as UrlEncurtadaEntity;
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(urlExistente);

      const resultado = await service.encurtarUrl(
        encurtarUrlDto,
        usuarioIdMock,
      );

      expect(mockUrlEncurtadaRepository_findOne).toHaveBeenCalledWith({
        where: {
          urlOriginal: encurtarUrlDto.urlOriginal,
          usuarioId: usuarioIdMock,
        },
      });
      expect(
        mockGeradorDeCodigoService_gerarCodigoUnico,
      ).not.toHaveBeenCalled();
      expect(resultado).toEqual({
        codigoCurto: urlExistente.codigoCurto,
        urlEncurtadaCompleta: `${expectedBaseUrl}/${urlExistente.codigoCurto}`,
        urlOriginal: urlExistente.urlOriginal,
      });
    });

    it('deve lançar InternalServerErrorException se gerarCodigoUnico falhar', async () => {
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService_gerarCodigoUnico.mockRejectedValue(
        new Error('Falha ao gerar'),
      );
      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar ConflictException para colisão tardia de código ao salvar', async () => {
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService_gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository_create.mockReturnValue(
        {} as UrlEncurtadaEntity,
      );
      const erroDb = { code: '23505', detail: 'contém (codigo_curto)' };
      mockUrlEncurtadaRepository_save.mockRejectedValue(erroDb);

      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar InternalServerErrorException para outros erros de save', async () => {
      mockUrlEncurtadaRepository_findOne.mockResolvedValue(null);
      mockGeradorDeCodigoService_gerarCodigoUnico.mockResolvedValue(
        codigoGeradoMock,
      );
      mockUrlEncurtadaRepository_create.mockReturnValue(
        {} as UrlEncurtadaEntity,
      );
      mockUrlEncurtadaRepository_save.mockRejectedValue(
        new Error('Outro erro DB'),
      );

      await expect(service.encurtarUrl(encurtarUrlDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

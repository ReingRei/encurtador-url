import { Test, TestingModule } from '@nestjs/testing';
import { GerenciadorMinhasUrlsService } from './gerenciador-minhas-urls.service';
import { CoreConfigService } from '@app/core-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { IsNull } from 'typeorm';
import { NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { AtualizarUrlDto, ListarMinhasUrlsQueryDto } from '../dtos';

const mockUrlEncurtadaRepository = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
};

const REDIRECTOR_BASE_URL_MOCK = 'http://short.test.com';
const mockCoreConfigService = {
  nodeEnv: 'test',
  portEncurtador: 3003,
};

describe('GerenciadorMinhasUrlsService', () => {
  let service: GerenciadorMinhasUrlsService;

  beforeAll(() => {
    process.env.REDIRECTOR_BASE_URL = REDIRECTOR_BASE_URL_MOCK;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GerenciadorMinhasUrlsService,
        Logger,
        {
          provide: getRepositoryToken(UrlEncurtadaEntity),
          useValue: mockUrlEncurtadaRepository,
        },
        {
          provide: CoreConfigService,
          useValue: mockCoreConfigService,
        },
      ],
    }).compile();
    service = module.get<GerenciadorMinhasUrlsService>(
      GerenciadorMinhasUrlsService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('listarPaginado', () => {
    const usuarioId = 'user-123';
    const queryDto: ListarMinhasUrlsQueryDto = { pagina: 1, limite: 10 };
    const mockUrlEntity = {
      id: 'url-1',
      urlOriginal: 'https://original.com',
      codigoCurto: 'orig1',
      cliques: 5,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    } as UrlEncurtadaEntity;

    it('deve listar URLs paginadas para um usuário', async () => {
      mockUrlEncurtadaRepository.findAndCount.mockResolvedValue([
        [mockUrlEntity],
        1,
      ]);
      const resultado = await service.listarPaginado(usuarioId, queryDto);

      expect(mockUrlEncurtadaRepository.findAndCount).toHaveBeenCalledWith({
        where: { usuarioId, dataExclusao: IsNull() },
        order: { dataCriacao: 'DESC' },
        take: queryDto.limite,
        skip: (queryDto.pagina - 1) * queryDto.limite,
      });
      expect(resultado.dados.length).toBe(1);
      expect(resultado.dados[0].codigoCurto).toBe(mockUrlEntity.codigoCurto);
      expect(resultado.totalItens).toBe(1);
      expect(resultado.totalPaginas).toBe(1);
      expect(resultado.paginaAtual).toBe(queryDto.pagina);
    });
  });

  describe('atualizarUrl', () => {
    const usuarioId = 'user-123';
    const idUrl = 'url-abc';
    const dadosAtualizacao: AtualizarUrlDto = {
      urlOriginal: 'https://novo-destino.com',
    };
    const mockUrlEntity = {
      id: idUrl,
      usuarioId: usuarioId,
      urlOriginal: 'https://antigo.com',
      codigoCurto: 'antigo',
      cliques: 0,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    } as UrlEncurtadaEntity;

    it('deve atualizar uma URL com sucesso', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(mockUrlEntity);
      mockUrlEncurtadaRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const resultado = await service.atualizarUrl(
        idUrl,
        usuarioId,
        dadosAtualizacao,
      );
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: { id: idUrl, dataExclusao: IsNull() },
      });
      expect(mockUrlEncurtadaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ urlOriginal: dadosAtualizacao.urlOriginal }),
      );
      expect(resultado?.urlOriginal).toBe(dadosAtualizacao.urlOriginal);
    });

    it('deve lançar NotFoundException se a URL não for encontrada', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      await expect(
        service.atualizarUrl(idUrl, usuarioId, dadosAtualizacao),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o usuário não for o proprietário', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue({
        ...mockUrlEntity,
        usuarioId: 'outro-user',
      });
      await expect(
        service.atualizarUrl(idUrl, usuarioId, dadosAtualizacao),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletarUrl', () => {
    const usuarioId = 'user-123';
    const idUrl = 'url-xyz';
    const mockUrlEntity = {
      id: idUrl,
      usuarioId: usuarioId,
    } as UrlEncurtadaEntity;

    it('deve deletar uma URL com sucesso', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(mockUrlEntity);
      mockUrlEncurtadaRepository.softDelete.mockResolvedValue({ affected: 1 });
      const resultado = await service.deletarUrl(idUrl, usuarioId);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: { id: idUrl, dataExclusao: IsNull() },
      });
      expect(mockUrlEncurtadaRepository.softDelete).toHaveBeenCalledWith(idUrl);
      expect(resultado.mensagem).toBe('URL encurtada deletada com sucesso.');
    });

    it('deve lançar NotFoundException se a URL não for encontrada para deletar', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);
      await expect(service.deletarUrl(idUrl, usuarioId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException se o usuário tentar deletar URL de outro', async () => {
      mockUrlEncurtadaRepository.findOne.mockResolvedValue({
        ...mockUrlEntity,
        usuarioId: 'outro-user',
      });
      await expect(service.deletarUrl(idUrl, usuarioId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, Logger } from '@nestjs/common';
import { RedirecionarService } from './redirecionar.service';
import { UrlEncurtadaEntity } from '@app/database/entities';

describe('RedirecionarService', () => {
  let service: RedirecionarService;
  let mockUrlRepository_findOne: jest.Mock;
  let mockUrlRepository_increment: jest.Mock;

  const mockUrlEncontrada: UrlEncurtadaEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    urlOriginal: 'https://exemplo.com/url-longa-original',
    codigoCurto: 'aZbKq7',
    dataCriacao: new Date(),
    cliques: 0,
    usuarioId: null,
    dataAtualizacao: new Date(),
    dataExclusao: null,
    usuario: null,
  };

  beforeEach(async () => {
    mockUrlRepository_findOne = jest.fn();
    mockUrlRepository_increment = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirecionarService,
        {
          provide: getRepositoryToken(UrlEncurtadaEntity),
          useValue: {
            findOne: mockUrlRepository_findOne,
            increment: mockUrlRepository_increment,
          },
        },
        Logger,
      ],
    }).compile();

    service = module.get<RedirecionarService>(RedirecionarService);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('processarRedirecionamento', () => {
    it('deve retornar a URL original e incrementar cliques se o código curto for encontrado', async () => {
      const codigoCurto = 'aZbKq7';
      mockUrlRepository_findOne.mockResolvedValue(mockUrlEncontrada);
      mockUrlRepository_increment.mockResolvedValue(undefined);

      const resultado = await service.processarRedirecionamento(codigoCurto);

      expect(mockUrlRepository_findOne).toHaveBeenCalledWith({
        where: { codigoCurto },
      });
      expect(mockUrlRepository_increment).toHaveBeenCalledWith(
        { id: mockUrlEncontrada.id },
        'cliques',
        1,
      );
      expect(resultado).toEqual(mockUrlEncontrada.urlOriginal);
    });

    it('deve lançar NotFoundException se o código curto não for encontrado', async () => {
      const codigoCurto = 'xxxxxx';
      mockUrlRepository_findOne.mockResolvedValue(null);

      await expect(
        service.processarRedirecionamento(codigoCurto),
      ).rejects.toThrow(
        new NotFoundException(
          `URL com código '${codigoCurto}' não encontrada ou está inativa.`,
        ),
      );
      expect(mockUrlRepository_findOne).toHaveBeenCalledWith({
        where: { codigoCurto },
      });
      expect(mockUrlRepository_increment).not.toHaveBeenCalled();
    });
  });
});

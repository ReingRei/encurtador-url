import { Test, TestingModule } from '@nestjs/testing';
import { GeradorDeCodigoService } from './gerador-de-codigo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities/url-encurtada.entity';
import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('GeradorDeCodigoService', () => {
  let service: GeradorDeCodigoService;

  const mockUrlEncurtadaRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeradorDeCodigoService,
        {
          provide: getRepositoryToken(UrlEncurtadaEntity),
          useValue: mockUrlEncurtadaRepository,
        },
        Logger,
      ],
    }).compile();

    service = module.get<GeradorDeCodigoService>(GeradorDeCodigoService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('gerarCodigoUnico', () => {
    it('deve gerar um código único na primeira tentativa', async () => {
      const codigoGerado = 'abcdef';
      (nanoid as jest.Mock).mockReturnValue(codigoGerado);
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);

      const resultado = await service.gerarCodigoUnico();

      expect(resultado).toBe(codigoGerado);
      expect(nanoid).toHaveBeenCalledTimes(1);
      expect(nanoid).toHaveBeenCalledWith(service['TAMANHO_CODIGO']);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledWith({
        where: { codigoCurto: codigoGerado },
      });
    });

    it('deve gerar um código único após algumas tentativas devido a colisões', async () => {
      const codigoColisao1 = 'colide1';
      const codigoColisao2 = 'colide2';
      const codigoUnico = 'unicoOk';

      (nanoid as jest.Mock)
        .mockReturnValueOnce(codigoColisao1)
        .mockReturnValueOnce(codigoColisao2)
        .mockReturnValueOnce(codigoUnico);

      mockUrlEncurtadaRepository.findOne
        .mockResolvedValueOnce({
          id: 'id1',
          codigoCurto: codigoColisao1,
        } as UrlEncurtadaEntity)
        .mockResolvedValueOnce({
          id: 'id2',
          codigoCurto: codigoColisao2,
        } as UrlEncurtadaEntity)
        .mockResolvedValueOnce(null);

      const resultado = await service.gerarCodigoUnico();

      expect(resultado).toBe(codigoUnico);
      expect(nanoid).toHaveBeenCalledTimes(3);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledTimes(3);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { codigoCurto: codigoColisao1 },
      });
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { codigoCurto: codigoColisao2 },
      });
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenNthCalledWith(3, {
        where: { codigoCurto: codigoUnico },
      });
    });

    it('deve lançar um erro se não conseguir gerar um código único após o número máximo de tentativas', async () => {
      const codigoColisao = 'colideX';
      (nanoid as jest.Mock).mockReturnValue(codigoColisao);
      mockUrlEncurtadaRepository.findOne.mockResolvedValue({
        id: 'idX',
        codigoCurto: codigoColisao,
      } as UrlEncurtadaEntity);

      await expect(service.gerarCodigoUnico()).rejects.toThrow(
        'Não foi possível gerar um código curto único. Por favor, tente novamente.',
      );

      expect(nanoid).toHaveBeenCalledTimes(service['MAX_TENTATIVAS_GERACAO']);
      expect(mockUrlEncurtadaRepository.findOne).toHaveBeenCalledTimes(
        service['MAX_TENTATIVAS_GERACAO'],
      );
    });

    it('deve usar o TAMANHO_CODIGO definido no serviço', async () => {
      const codigoGerado = 'tstcod';
      (nanoid as jest.Mock).mockReturnValue(codigoGerado);
      mockUrlEncurtadaRepository.findOne.mockResolvedValue(null);

      await service.gerarCodigoUnico();
      expect(nanoid).toHaveBeenCalledWith(service['TAMANHO_CODIGO']);
    });
  });
});

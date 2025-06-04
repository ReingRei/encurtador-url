import { Test, TestingModule } from '@nestjs/testing';
import { EncurtadorUrlController } from './encurtador-url.controller';
import { EncurtadorUrlService } from './encurtador-url.service';
import { EncurtarUrlDto } from './dtos/encurtar-url.dto';
import { UrlEncurtadaRespostaDto } from './dtos/url-encurtada-resposta.dto';
import { Logger, ConflictException } from '@nestjs/common';

describe('EncurtadorUrlController', () => {
  let controller: EncurtadorUrlController;
  let service: EncurtadorUrlService;

  const mockEncurtadorUrlService = {
    encurtarUrl: jest.fn(),
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
        Logger,
      ],
    }).compile();

    controller = module.get<EncurtadorUrlController>(EncurtadorUrlController);
    service = module.get<EncurtadorUrlService>(EncurtadorUrlService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('encurtar', () => {
    it('deve chamar encurtadorUrlService.encurtarUrl e retornar o resultado', async () => {
      const dto: EncurtarUrlDto = { urlOriginal: 'https://google.com' };
      const resultadoEsperado: UrlEncurtadaRespostaDto = {
        codigoCurto: 'g00g1e',
        urlEncurtadaCompleta: 'http://short.test/g00g1e',
        urlOriginal: 'https://google.com',
      };
      mockEncurtadorUrlService.encurtarUrl.mockResolvedValue(resultadoEsperado);

      const resultado = await controller.encurtar(dto);

      expect(service?.['encurtarUrl']).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(resultadoEsperado);
    });

    it('deve repassar ConflictException do serviço', async () => {
      const dto: EncurtarUrlDto = { urlOriginal: 'https://google.com' };
      mockEncurtadorUrlService.encurtarUrl.mockRejectedValue(
        new ConflictException('Conflito'),
      );
      await expect(controller.encurtar(dto)).rejects.toThrow(ConflictException);
    });
  });
});

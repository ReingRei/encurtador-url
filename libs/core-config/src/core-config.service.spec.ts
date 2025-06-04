import { Test, TestingModule } from '@nestjs/testing';
import { CoreConfigService } from './core-config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';

const mockNestConfigService = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

describe('CoreConfigService', () => {
  let service: CoreConfigService;

  beforeEach(async () => {
    mockNestConfigService.get.mockReset();
    mockNestConfigService.getOrThrow.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreConfigService,
        {
          provide: NestConfigService,
          useValue: mockNestConfigService,
        },
      ],
    }).compile();

    service = module.get<CoreConfigService>(CoreConfigService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('NodeEnv', () => {
    it('deve retornar NODE_ENV do NestConfigService', () => {
      const mockEnv = 'development';
      mockNestConfigService.get.mockReturnValueOnce(mockEnv);

      const nodeEnv = service.nodeEnv;

      expect(nodeEnv).toBe(mockEnv);
      expect(mockNestConfigService.get).toHaveBeenCalledWith(
        'NODE_ENV',
        'development',
      );
    });
  });

  describe('ConfiguracaoDoBancoDeDados', () => {
    it('deve retornar DB_HOST usando getOrThrow', () => {
      const mockDbHost = 'localhost_teste';
      mockNestConfigService.getOrThrow.mockReturnValueOnce(mockDbHost);

      const dbHost = service.dbHost;

      expect(dbHost).toBe(mockDbHost);
      expect(mockNestConfigService.getOrThrow).toHaveBeenCalledWith('DB_HOST');
    });

    it('deve lançar erro se DB_HOST estiver ausente (ao usar getOrThrow)', () => {
      mockNestConfigService.getOrThrow.mockImplementationOnce(() => {
        throw new Error('DB_HOST ausente');
      });

      expect(() => service.dbHost).toThrow('DB_HOST ausente');
      expect(mockNestConfigService.getOrThrow).toHaveBeenCalledWith('DB_HOST');
    });

    it('deve retornar dbPort do NestConfigService ou o valor padrão', () => {
      const mockDbPort = 5433;
      mockNestConfigService.get.mockReturnValueOnce(mockDbPort);
      expect(service.dbPort).toBe(mockDbPort);
      expect(mockNestConfigService.get).toHaveBeenCalledWith('DB_PORT');

      mockNestConfigService.get.mockReset();
      mockNestConfigService.get.mockReturnValueOnce(undefined);
      expect(service.dbPort).toBe(5432);
      expect(mockNestConfigService.get).toHaveBeenCalledWith('DB_PORT');
    });
  });

  describe('ConfiguracaoJWT', () => {
    it('deve retornar JWT_SECRET usando getOrThrow', () => {
      const mockSecret = 'segredo_de_teste';
      mockNestConfigService.getOrThrow.mockReturnValueOnce(mockSecret);
      expect(service.jwtSecret).toBe(mockSecret);
      expect(mockNestConfigService.getOrThrow).toHaveBeenCalledWith(
        'JWT_SECRET',
      );
    });

    it('deve retornar JWT_EXPIRATION_TIME ou o valor padrão', () => {
      const mockExpTime = '1h_teste';
      mockNestConfigService.get.mockReturnValueOnce(mockExpTime);
      expect(service.jwtExpirationTime).toBe(mockExpTime);
      expect(mockNestConfigService.get).toHaveBeenCalledWith(
        'JWT_EXPIRATION_TIME',
        '3600s',
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RedirecionarController } from './redirecionar.controller';
import { RedirecionarService } from './redirecionar.service';

describe('RedirecionarController', () => {
  let controller: RedirecionarController;
  let mockRedirecionarService_processarRedirecionamento: jest.Mock;

  const mockResponse: Partial<Response> = {
    redirect: jest.fn(),
  };

  beforeEach(async () => {
    mockRedirecionarService_processarRedirecionamento = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirecionarController],
      providers: [
        {
          provide: RedirecionarService,
          useValue: {
            processarRedirecionamento:
              mockRedirecionarService_processarRedirecionamento,
          },
        },
        Logger,
      ],
    }).compile();

    controller = module.get<RedirecionarController>(RedirecionarController);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('redirecionar', () => {
    const codigoCurtoValido = 'aZbKq7';
    const urlOriginal = 'https://exemplo.com/original';

    it('deve redirecionar para a URL original se o código for válido e encontrado', async () => {
      mockRedirecionarService_processarRedirecionamento.mockResolvedValue(
        urlOriginal,
      );

      await controller.redirecionar(
        codigoCurtoValido,
        mockResponse as Response,
      );

      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).toHaveBeenCalledWith(codigoCurtoValido);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        HttpStatus.FOUND,
        urlOriginal,
      );
    });

    it('deve lançar BadRequestException se o código curto for inválido (menor que 6 caracteres)', async () => {
      const codigoCurtoInvalido = 'aZbKq';

      await expect(
        controller.redirecionar(codigoCurtoInvalido, mockResponse as Response),
      ).rejects.toThrow(
        new BadRequestException(
          'O código curto deve ter exatamente 6 caracteres.',
        ),
      );
      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o código curto for inválido (maior que 6 caracteres)', async () => {
      const codigoCurtoInvalido = 'aZbKq7X';

      await expect(
        controller.redirecionar(codigoCurtoInvalido, mockResponse as Response),
      ).rejects.toThrow(
        new BadRequestException(
          'O código curto deve ter exatamente 6 caracteres.',
        ),
      );
      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o código curto não for fornecido', async () => {
      await expect(
        controller.redirecionar(null as any, mockResponse as Response),
      ).rejects.toThrow(
        new BadRequestException(
          'O código curto deve ter exatamente 6 caracteres.',
        ),
      );
      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o serviço lançar NotFoundException', async () => {
      const mensagemErro = `URL com código '${codigoCurtoValido}' não encontrada ou está inativa.`;
      mockRedirecionarService_processarRedirecionamento.mockRejectedValue(
        new NotFoundException(mensagemErro),
      );

      await expect(
        controller.redirecionar(codigoCurtoValido, mockResponse as Response),
      ).rejects.toThrow(new NotFoundException(mensagemErro));
      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).toHaveBeenCalledWith(codigoCurtoValido);
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para erros inesperados do serviço que não sejam NotFoundException', async () => {
      const erroGenerico = new Error('Erro genérico no serviço');
      mockRedirecionarService_processarRedirecionamento.mockRejectedValue(
        erroGenerico,
      );

      await expect(
        controller.redirecionar(codigoCurtoValido, mockResponse as Response),
      ).rejects.toThrow(
        new BadRequestException(
          'Não foi possível processar sua solicitação de redirecionamento.',
        ),
      );
      expect(
        mockRedirecionarService_processarRedirecionamento,
      ).toHaveBeenCalledWith(codigoCurtoValido);
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });
});

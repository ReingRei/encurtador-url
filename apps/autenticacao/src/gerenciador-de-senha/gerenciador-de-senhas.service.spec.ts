import { Test, TestingModule } from '@nestjs/testing';
import { GerenciadorDeSenhaService } from './gerenciador-de-senha.service';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException, Logger } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('GerenciadorDeSenhaService', () => {
  let service: GerenciadorDeSenhaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GerenciadorDeSenhaService, Logger],
    }).compile();

    service = module.get<GerenciadorDeSenhaService>(GerenciadorDeSenhaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('gerarHash', () => {
    it('deve gerar um hash com sucesso', async () => {
      const senhaPlana = 'minhaSenha123';
      const senhaHasheada = 'hashDaSenhaGerado';
      (bcrypt.hash as jest.Mock).mockResolvedValue(senhaHasheada);

      const resultado = await service.gerarHash(senhaPlana);

      expect(resultado).toBe(senhaHasheada);
      expect(bcrypt.hash).toHaveBeenCalledWith(senhaPlana, 10);
    });

    it('deve lançar InternalServerErrorException se bcrypt.hash falhar', async () => {
      const senhaPlana = 'minhaSenha123';
      (bcrypt.hash as jest.Mock).mockRejectedValue(Error('Erro no bcrypt'));

      await expect(service.gerarHash(senhaPlana)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('compararSenhas', () => {
    it('deve retornar true se as senhas corresponderem', async () => {
      const senhaFornecida = 'minhaSenha123';
      const hashArmazenado = 'hashDaSenhaGerado';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultado = await service.compararSenhas(
        senhaFornecida,
        hashArmazenado,
      );

      expect(resultado).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        senhaFornecida,
        hashArmazenado,
      );
    });

    it('deve retornar false se as senhas não corresponderem', async () => {
      const senhaFornecida = 'senhaErrada';
      const hashArmazenado = 'hashDaSenhaGerado';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const resultado = await service.compararSenhas(
        senhaFornecida,
        hashArmazenado,
      );

      expect(resultado).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        senhaFornecida,
        hashArmazenado,
      );
    });

    it('deve lançar InternalServerErrorException se bcrypt.compare falhar', async () => {
      const senhaFornecida = 'minhaSenha123';
      const hashArmazenado = 'hashDaSenhaGerado';
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        Error('Erro no bcrypt compare'),
      );

      await expect(
        service.compararSenhas(senhaFornecida, hashArmazenado),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});

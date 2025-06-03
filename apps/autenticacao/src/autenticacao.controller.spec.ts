import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';

describe('AutenticacaoController', () => {
  let autenticacaoController: AutenticacaoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AutenticacaoController],
      providers: [AutenticacaoService],
    }).compile();

    autenticacaoController = app.get<AutenticacaoController>(AutenticacaoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(autenticacaoController.getHello()).toBe('Hello World!');
    });
  });
});

import { Controller, Get } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';

@Controller()
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Get()
  getHello(): string {
    return this.autenticacaoService.getHello();
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AutenticacaoService {
  getHello(): string {
    return 'Hello World!';
  }
}

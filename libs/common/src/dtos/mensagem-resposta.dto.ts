import { ApiProperty } from '@nestjs/swagger';

export class MensagemRespostaDto {
  @ApiProperty({
    description: 'Mensagem de resposta da operação.',
    example: 'Operação realizada com sucesso.',
  })
  mensagem: string;
}
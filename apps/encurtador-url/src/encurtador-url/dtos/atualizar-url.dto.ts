import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class AtualizarUrlDto {
  @ApiProperty({
    description: 'A nova URL original de destino.',
    example: 'https://www.bing.com/search?q=nestjs',
    maxLength: 2048,
  })
  @IsNotEmpty({ message: 'A urlOriginal não pode estar vazia.' })
  @IsString({ message: 'A urlOriginal deve ser uma string.' })
  @MaxLength(2048, {
    message: 'A urlOriginal excede o tamanho máximo permitido.',
  })
  @IsUrl(
    {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https'],
    },
    {
      message:
        'Formato de URL inválido. Deve incluir o protocolo http ou https e ser uma URL válida.',
    },
  )
  urlOriginal: string;
}

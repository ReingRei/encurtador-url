import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";

export class EncurtarUrlDto {
  @ApiProperty({
    description: 'A URL original a ser encurtada.',
    example: 'https://www.google.com/search?q=nestjs',
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

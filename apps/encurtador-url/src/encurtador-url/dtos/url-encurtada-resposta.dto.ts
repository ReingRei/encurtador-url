import { ApiProperty } from '@nestjs/swagger';

export class UrlEncurtadaRespostaDto {
  @ApiProperty({
    description: 'O código curto gerado para a URL.',
    example: 'aB1cD2',
  })
  codigoCurto: string;

  @ApiProperty({
    description: 'A URL encurtada completa, pronta para ser usada.',
    example: 'http://localhost:3002/api/r/aB1cD2',
  })
  urlEncurtadaCompleta: string;

  @ApiProperty({
    description: 'A URL original que foi encurtada.',
    example: 'https://www.google.com/search?q=nestjs+framework+docs',
  })
  urlOriginal: string;
}

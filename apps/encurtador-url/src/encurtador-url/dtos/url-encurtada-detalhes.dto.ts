import { ApiProperty } from '@nestjs/swagger';

export class UrlEncurtadaDetalhesDto {
  @ApiProperty({ example: 'd1b2c3a4-e5f6-7890-1234-567890abcdef' })
  id: string;

  @ApiProperty({
    example: 'https://www.google.com/very/long/url/to/be/shortened',
  })
  urlOriginal: string;

  @ApiProperty({ example: 'aB1cD2' })
  codigoCurto: string;

  @ApiProperty({ example: 'http://short.test.com/aB1cD2' })
  urlEncurtadaCompleta: string;

  @ApiProperty({ example: 150 })
  cliques: number;

  @ApiProperty({ example: '2025-06-05T10:00:00.000Z' })
  dataCriacao: Date;

  @ApiProperty({ example: '2025-06-05T12:30:00.000Z' })
  dataAtualizacao: Date;
}

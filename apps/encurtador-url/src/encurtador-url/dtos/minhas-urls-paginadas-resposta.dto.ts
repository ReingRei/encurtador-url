import { ApiProperty } from '@nestjs/swagger';
import { UrlEncurtadaDetalhesDto } from './url-encurtada-detalhes.dto';

export class MinhasUrlsPaginadasRespostaDto {
  @ApiProperty({ isArray: true, type: UrlEncurtadaDetalhesDto })
  dados: UrlEncurtadaDetalhesDto[];

  @ApiProperty({ description: 'Total de itens encontrados.', example: 100 })
  totalItens: number;

  @ApiProperty({ description: 'Total de páginas disponíveis.', example: 10 })
  totalPaginas: number;

  @ApiProperty({ description: 'Página atual.', example: 1 })
  paginaAtual: number;

  @ApiProperty({ description: 'Quantidade de itens por página.', example: 10 })
  itensPorPagina: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListarMinhasUrlsQueryDto {
  @ApiPropertyOptional({
    description: 'Número da página desejada.',
    default: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O número da página deve ser um inteiro.' })
  @Min(1, { message: 'O número da página deve ser no mínimo 1.' })
  pagina: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página.',
    default: 10,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite de itens por página deve ser um inteiro.' })
  @Min(1, { message: 'O limite de itens deve ser no mínimo 1.' })
  @Max(100, { message: 'O limite de itens não pode exceder 100.' })
  limite: number = 10;
}

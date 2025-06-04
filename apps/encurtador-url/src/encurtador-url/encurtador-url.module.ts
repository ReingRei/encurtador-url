import { Module } from '@nestjs/common';
import { EncurtadorUrlService } from './encurtador-url.service';
import { EncurtadorUrlController } from './encurtador-url.controller';
import { GeradorDeCodigoService } from './gerador-de-codigo/gerador-de-codigo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEncurtadaEntity])],
  providers: [EncurtadorUrlService, GeradorDeCodigoService],
  controllers: [EncurtadorUrlController],
})
export class EncurtadorUrlModule {}

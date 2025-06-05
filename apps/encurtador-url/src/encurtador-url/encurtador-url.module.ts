import { Module } from '@nestjs/common';
import { EncurtadorUrlService } from './encurtador-url.service';
import { EncurtadorUrlController } from './encurtador-url.controller';
import { GeradorDeCodigoService } from './gerador-de-codigo/gerador-de-codigo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEncurtadaEntity } from '@app/database/entities';
import { PassportModule } from '@nestjs/passport';
import { GerenciadorMinhasUrlsService } from './gerenciador-minhas-urls/gerenciador-minhas-urls.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlEncurtadaEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    EncurtadorUrlService,
    GeradorDeCodigoService,
    GerenciadorMinhasUrlsService,
  ],
  controllers: [EncurtadorUrlController],
})
export class EncurtadorUrlModule {}

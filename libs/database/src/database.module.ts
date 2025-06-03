import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as TodasAsEntidades from './entities';
import { CoreConfigModule, CoreConfigService } from '@app/core-config';

const entidadesArray = Object.values(TodasAsEntidades);

@Module({
  imports: [
    CoreConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CoreConfigModule],
      useFactory: (coreConfigService: CoreConfigService) => ({
        type: 'postgres',
        host: coreConfigService.dbHost,
        port: coreConfigService.dbPort,
        username: coreConfigService.dbUsername,
        password: coreConfigService.dbPassword,
        database: coreConfigService.dbDatabase,
        synchronize: coreConfigService.dbSynchronize,
        logging: coreConfigService.dbLogging,
        autoLoadEntities: true,
        entities: entidadesArray,
      }),
      inject: [CoreConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CustomHttpModule } from './customHttp.module';
import {
  StatisticsDocument,
  StatisticsSchema,
} from '../models/schemas/statistics.schema';
import { TracesController } from '../controllers/traces.controller';
import { TracesService } from '../services/traces.service';
import { DistanceToUsa } from '../utils/distanceToUsa';

@Module({
  imports: [
    CustomHttpModule,
    MongooseModule.forFeature([
      {
        name: StatisticsDocument.name,
        schema: StatisticsSchema,
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>('appConfig.tracesCacheTtl')),
        max: parseInt(configService.get<string>('appConfig.tracesCacheMaxReg')),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TracesController],
  providers: [TracesService, DistanceToUsa],
})
export class TracesModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { StatisticsController } from '../controllers/statistics.controller';
import { StatisticsService } from '../services/statistics.service';
import {
  StatisticsDocument,
  StatisticsSchema,
} from '../models/schemas/statistics.schema';
import { Formatter } from '../utils/formatter';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StatisticsDocument.name,
        schema: StatisticsSchema,
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: parseInt(
          configService.get<string>('appConfig.statisticsCacheTtl'),
        ),
        max: parseInt(
          configService.get<string>('appConfig.statisticsCacheMaxReg'),
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, Formatter],
})
export class StatisticsModule {}

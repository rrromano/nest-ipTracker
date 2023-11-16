import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import appConfig from './config/app.config';
import fixerApiConfig from './config/currencyApi.config';
import ipApiConfig from './config/ipApi.config';
import { TracesModule } from './modules/traces.module';
import { StatisticsModule } from './modules/statistics.module';
import { AllExceptionsFilter } from './filters/allException.filter';
import { CorsMiddleware } from './middlewares/cors.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, fixerApiConfig, ipApiConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('appConfig.mongoDbUrl'),
        dbName: configService.get<string>('appConfig.mongoDbName'),
      }),
      inject: [ConfigService],
    }),
    TracesModule,
    StatisticsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}

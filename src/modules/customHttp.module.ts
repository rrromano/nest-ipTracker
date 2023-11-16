import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('appConfig.httpTimeOut'),
        maxRedirects: configService.get<number>('appConfig.httpMaxRedirects'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [HttpModule],
})
export class CustomHttpModule {}

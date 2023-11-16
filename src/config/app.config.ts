import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  host: process.env.APP_HOST,
  port: process.env.APP_PORT,
  loggerLevel: process.env.LOGGER_LEVEL,
  mongoDbUrl: process.env.MONGODB_URL,
  mongoDbName: process.env.MONGODB_NAME,
  tracesCacheTtl: process.env.TRACES_CACHE_TTL,
  tracesCacheMaxReg: process.env.TRACES_CACHE_MAX_REG,
  statisticsCacheTtl: process.env.STATISTICS_CACHE_TTL,
  statisticsCacheMaxReg: process.env.STATISTICS_CACHE_MAX_REG,
  httpTimeOut: process.env.HTTP_TIMEOUT,
  httpMaxRedirects: process.env.HTTP_MAX_REDIRECTS,
  whiteListOrigin: process.env.WHITE_LIST_ORIGIN,
  usaLat: process.env.USA_LAT,
  usaLon: process.env.USA_LON,
}));

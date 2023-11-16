import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';

import { TracesService } from '../../src/services/traces.service';
import { DistanceToUsa } from '../../src/utils/distanceToUsa';
import { StatisticsDocument } from '../../src/models/schemas/statistics.schema';
import { Currency, Traces } from '../../src/models/entities/traces.entity';

describe('TracesService', () => {
  let service: TracesService;
  let cacheManager: Cache;
  let httpService: HttpService;
  let configService: ConfigService;
  let distanceToUsa: DistanceToUsa;
  let statisticsModel: Model<StatisticsDocument>;
  const ip = '190.193.92.69';
  const cacheKeyIp = `ip_${ip}`;
  const traces: Traces = {
    ip: '190.193.92.69',
    name: 'Argentina',
    code: 'AR',
    lat: -31.6622,
    lon: -60.7616,
    currencies: [
      {
        iso: 'ARS',
        symbol: '$',
        conversion_rate: 0.002855,
      },
      {
        iso: 'USD',
        symbol: '$',
        conversion_rate: 1,
      },
    ],
    distance_to_usa: 8463.81,
  };
  const ipApiData: IpApi = {
    status: 'success',
    country: 'Argentina',
    countryCode: 'AR',
    regionName: 'Buenos Aires',
    city: 'Merlo',
    lat: -31.6622,
    lon: -60.7616,
    currency: 'ARS',
  };
  const cacheKeyCurrency = `currency_${ipApiData.currency.toUpperCase()}`;
  const cacheKeyLocation = `location_${ipApiData.lat}_${ipApiData.lon}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracesService,
        {
          provide: getModelToken(StatisticsDocument.name),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DistanceToUsa,
          useValue: {
            calculateDistanceToUsa: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TracesService>(TracesService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    distanceToUsa = module.get<DistanceToUsa>(DistanceToUsa);
    statisticsModel = module.get<Model<StatisticsDocument>>(
      getModelToken(StatisticsDocument.name),
    );
  });

  describe('getTracesInfo', () => {
    it('should return traces from cache if available by ip', async () => {
      const cacheResultIp = {
        ip: '190.193.92.69',
        name: 'Argentina',
        code: 'AR',
        lat: -31.6622,
        lon: -60.7616,
        currencies: [
          {
            iso: 'ARS',
            symbol: '$',
            conversion_rate: 0.002855,
          },
          {
            iso: 'USD',
            symbol: '$',
            conversion_rate: 1,
          },
        ],
        distance_to_usa: 8463.81,
      };
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(cacheResultIp);

      const result = await service.getTracesInfo(ip);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKeyIp);
      expect(result).toEqual(cacheResultIp);
    });

    it('should return traces from cache if available by currency and location and not by ip', async () => {
      const cacheResultCurrency = [
        {
          iso: 'ARS',
          symbol: '$',
          conversion_rate: 0.002855,
        },
        {
          iso: 'USD',
          symbol: '$',
          conversion_rate: 1,
        },
      ];
      const cacheResultLocation = 8463.81;
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(cacheResultCurrency)
        .mockResolvedValueOnce(cacheResultLocation);
      jest.spyOn(service, 'getIpInfo').mockResolvedValue(ipApiData);

      jest.spyOn(cacheManager, 'set');
      jest.spyOn(service, 'saveStatistics').mockResolvedValue(undefined);

      const result = await service.getTracesInfo(ip);

      expect(cacheManager.get).toHaveBeenCalledTimes(3);
      expect(cacheManager.get).toHaveBeenNthCalledWith(1, cacheKeyIp);
      expect(cacheManager.get).toHaveBeenNthCalledWith(2, cacheKeyCurrency);
      expect(cacheManager.get).toHaveBeenNthCalledWith(3, cacheKeyLocation);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKeyIp, traces);
      expect(service.saveStatistics).toHaveBeenCalled();
      expect(result).toEqual(traces);
    });

    it('should return new traces if not available in cache', async () => {
      const currencyApiUrlBase = 'https://api.currencyapi.com/v3/';
      const currencyApiAccessKey = '123456';
      const currencyApiSymbol = '$';
      const currencyApiConversionRate = 0.002855;
      const currencies: Currency[] = [
        {
          iso: 'ARS',
          symbol: '$',
          conversion_rate: 0.002855,
        },
        {
          iso: 'USD',
          symbol: '$',
          conversion_rate: 1,
        },
      ];
      const distance_to_usa = 8463.81;
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      jest.spyOn(service, 'getIpInfo').mockResolvedValue(ipApiData);
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce(currencyApiUrlBase)
        .mockReturnValueOnce(currencyApiAccessKey);
      jest
        .spyOn(service, 'getCurrencySymbol')
        .mockResolvedValue(currencyApiSymbol);
      jest
        .spyOn(service, 'getCurrencyConvertionRate')
        .mockResolvedValue(currencyApiConversionRate);
      jest
        .spyOn(distanceToUsa, 'calculateDistanceToUsa')
        .mockReturnValue(distance_to_usa);
      jest.spyOn(cacheManager, 'set');
      jest.spyOn(service, 'saveStatistics').mockResolvedValue(undefined);

      const result = await service.getTracesInfo(ip);

      expect(cacheManager.get).toHaveBeenCalledTimes(3);
      expect(cacheManager.get).toHaveBeenNthCalledWith(1, cacheKeyIp);
      expect(cacheManager.get).toHaveBeenNthCalledWith(2, cacheKeyCurrency);
      expect(cacheManager.get).toHaveBeenNthCalledWith(3, cacheKeyLocation);
      expect(cacheManager.set).toHaveBeenCalledTimes(3);
      expect(cacheManager.set).toHaveBeenNthCalledWith(
        1,
        cacheKeyCurrency,
        currencies,
      );
      expect(cacheManager.set).toHaveBeenNthCalledWith(
        2,
        cacheKeyLocation,
        distance_to_usa,
      );
      expect(cacheManager.set).toHaveBeenNthCalledWith(3, cacheKeyIp, traces);
      expect(service.getIpInfo).toHaveBeenCalledWith(ip);
      expect(configService.get).toHaveBeenCalledTimes(2);
      expect(configService.get).toHaveBeenNthCalledWith(
        1,
        'currencyApiConfig.urlBase',
      );
      expect(configService.get).toHaveBeenNthCalledWith(
        2,
        'currencyApiConfig.accessKey',
      );
      expect(service.getCurrencySymbol).toHaveBeenCalledWith(
        currencyApiUrlBase,
        currencyApiAccessKey,
        ipApiData.currency.toUpperCase(),
      );
      expect(service.getCurrencyConvertionRate).toHaveBeenCalledWith(
        currencyApiUrlBase,
        currencyApiAccessKey,
        ipApiData.currency.toUpperCase(),
      );
      expect(distanceToUsa.calculateDistanceToUsa).toHaveBeenCalledWith(
        ipApiData.lat,
        ipApiData.lon,
      );
      expect(service.saveStatistics).toHaveBeenCalled();
      expect(result).toEqual(traces);
    });
  });

  describe('getIpInfo', () => {
    it('should return the ip info', async () => {
      const axiosResponseMock = {
        data: ipApiData,
      };
      jest.spyOn(configService, 'get');
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue(axiosResponseMock);

      const result = await service.getIpInfo(ip);
      expect(configService.get).toHaveBeenCalledTimes(2);
      expect(configService.get).toHaveBeenNthCalledWith(
        1,
        'ipApiConfig.urlBase',
      );
      expect(configService.get).toHaveBeenNthCalledWith(
        2,
        'ipApiConfig.urlGeolocation',
      );
      expect(result).toEqual(ipApiData);
    });

    it('should return BadRequestException', async () => {
      const axiosResponseMock = {
        data: {
          status: 'fail',
        },
      };
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue(axiosResponseMock);

      await expect(service.getIpInfo(ip)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return the currency symbol', async () => {
      const currencyApiUrlBase = 'https://api.currencyapi.com/v3/';
      const currencyApiAccessKey = '123456';
      const ipApiDataCurrency = 'ARS';
      const symbol = '$';
      const axiosResponseMock = {
        data: {
          data: {
            ARS: { symbol_native: symbol },
          },
        },
      };
      jest.spyOn(configService, 'get');
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue(axiosResponseMock);

      const result = await service.getCurrencySymbol(
        currencyApiUrlBase,
        currencyApiAccessKey,
        ipApiDataCurrency,
      );
      expect(configService.get).toHaveBeenCalledWith(
        'currencyApiConfig.urlCurrencies',
      );
      expect(result).toEqual(symbol);
    });
  });

  describe('getCurrencyConvertionRate', () => {
    it('should return the convertion rate', async () => {
      const currencyApiUrlBase = 'https://api.currencyapi.com/v3/';
      const currencyApiAccessKey = '123456';
      const ipApiDataCurrency = 'ARS';
      const convertionRate = 0.002855;
      const axiosResponseMock = {
        data: {
          data: {
            ARS: { value: convertionRate },
          },
        },
      };
      jest.spyOn(configService, 'get');
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockResolvedValue(axiosResponseMock);

      const result = await service.getCurrencyConvertionRate(
        currencyApiUrlBase,
        currencyApiAccessKey,
        ipApiDataCurrency,
      );
      expect(configService.get).toHaveBeenCalledWith(
        'currencyApiConfig.urlLatestRate',
      );
      expect(Number((1 / result).toFixed(6))).toEqual(convertionRate);
    });
  });

  describe('saveStatistics', () => {
    it('should call statisticsModel create', async () => {
      const statisticsData: StatisticsData = {
        regionName: 'Buenos Aires',
        city: 'Merlo',
        country: 'Argentina',
        distanceToUsa: 8463.81,
      };
      jest.spyOn(statisticsModel, 'create');

      await service.saveStatistics(statisticsData);
      expect(statisticsModel.create).toHaveBeenCalledWith(statisticsData);
    });
  });
});

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Model } from 'mongoose';

import { StatisticsDocument } from '../models/schemas/statistics.schema';
import { Traces, Currency } from '../models/entities/traces.entity';
import { DistanceToUsa } from '../utils/distanceToUsa';

@Injectable()
export class TracesService {
  private readonly logger = new Logger(TracesService.name);
  constructor(
    @InjectModel(StatisticsDocument.name)
    private readonly statisticsModel: Model<StatisticsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private distanceToUsa: DistanceToUsa,
  ) {}
  async getTracesInfo(ip: string): Promise<Traces> {
    const traces: Traces = new Traces();
    // Search the traces in the cache by ip
    const cacheKeyIp: string = `ip_${ip}`;
    const cacheResultIp = await this.cacheManager.get(cacheKeyIp);

    if (cacheResultIp) {
      // Log the result in mode debug
      this.logger.debug(`cacheResultIp: ${JSON.stringify(cacheResultIp)}`);
      // If I find the traces by ip, I return it
      return cacheResultIp as Traces;
    }

    // I call the ip-api service to get the ip info
    const ipApiData: IpApi = await this.getIpInfo(ip);
    const ipApiDataCurrency: string = ipApiData.currency.toUpperCase();

    // Build part of the traces with ipAPi info
    traces.ip = ip;
    traces.name = ipApiData.country;
    traces.code = ipApiData.countryCode;
    traces.lat = ipApiData.lat;
    traces.lon = ipApiData.lon;

    // Search the currency array in the cache by currency
    const cacheKeyCurrency = `currency_${ipApiDataCurrency}`;
    const cacheResultCurrency = await this.cacheManager.get(cacheKeyCurrency);

    if (cacheResultCurrency) {
      // If I find the currency in the cache, I add it to traces
      traces.currencies = cacheResultCurrency as Currency[];
    } else {
      // If I do not find the currency in the cache, I get it, add it to the traces and persist it in the cache
      const currencies: Currency[] = [
        {
          iso: 'USD',
          symbol: '$',
          conversion_rate: 1,
        },
      ];

      // If the currency is other than USD, I get the currency info
      if (ipApiDataCurrency !== 'USD') {
        const currencyApiUrlBase: string = this.configService.get<string>(
          'currencyApiConfig.urlBase',
        );
        const currencyApiAccessKey: string = this.configService.get<string>(
          'currencyApiConfig.accessKey',
        );

        // Call the currency-api currencies service to get the currency symbol info
        const currencyApiSymbol: string = await this.getCurrencySymbol(
          currencyApiUrlBase,
          currencyApiAccessKey,
          ipApiDataCurrency,
        );

        // Call the currency-api latest service to get the currency conversion info
        const currencyApiConversionRate: number =
          await this.getCurrencyConvertionRate(
            currencyApiUrlBase,
            currencyApiAccessKey,
            ipApiDataCurrency,
          );

        // Add the currency item to the currencies array
        currencies.unshift({
          iso: ipApiDataCurrency,
          symbol: currencyApiSymbol,
          conversion_rate: currencyApiConversionRate,
        });
      }

      // Build the traces currencies
      traces.currencies = currencies;

      // Persist the currencies in the cache by currency
      await this.cacheManager.set(cacheKeyCurrency, currencies);
    }

    // Search the distance to usa in the cache by location
    const cacheKeyLocation = `location_${ipApiData.lat}_${ipApiData.lon}`;
    const cacheResultLocation = await this.cacheManager.get(cacheKeyLocation);

    if (cacheResultLocation) {
      // If I find the distance to usa in the cache, I add it to traces
      traces.distance_to_usa = cacheResultLocation as number;
    } else {
      // If I do not find the distance to usa in the cache, I get it, add it to the traces and persist it in the cache
      const distance_to_usa = this.distanceToUsa.calculateDistanceToUsa(
        ipApiData.lat,
        ipApiData.lon,
      );
      traces.distance_to_usa = distance_to_usa;

      // Persist the distance to usa in the cache by location
      await this.cacheManager.set(cacheKeyLocation, distance_to_usa);
    }

    // Persist the traces in the cache by ip
    await this.cacheManager.set(cacheKeyIp, traces);

    // Save statistics data in the model
    const statisticsData: StatisticsData = {
      regionName: ipApiData.regionName.toLowerCase(),
      city: ipApiData.city.toLowerCase(),
      country: ipApiData.country.toLowerCase(),
      distanceToUsa: traces.distance_to_usa,
    };
    await this.saveStatistics(statisticsData);

    // Log the result in mode debug
    this.logger.debug(`traces: ${JSON.stringify(traces)}`);

    // Return traces object;
    return traces;
  }

  async getIpInfo(ip: string): Promise<IpApi> {
    const ipApiUrlBase: string = this.configService.get<string>(
      'ipApiConfig.urlBase',
    );
    const ipApiUrlGeolocation: string = this.configService.get<string>(
      'ipApiConfig.urlGeolocation',
    );

    const ipApiResponse: AxiosResponse = await this.httpService.axiosRef.get(
      `${ipApiUrlBase}${ip}?${ipApiUrlGeolocation}`,
    );
    const ipApiData = ipApiResponse.data;
    if (ipApiData.status !== 'success')
      throw new BadRequestException(ipApiData.message);

    return ipApiData;
  }

  async getCurrencySymbol(
    currencyApiUrlBase: string,
    currencyApiAccessKey: string,
    ipApiDataCurrency: string,
  ): Promise<string> {
    const currencyApiUrlCurrencies: string = this.configService.get<string>(
      'currencyApiConfig.urlCurrencies',
    );

    const currencyApiCurrenciesResponse: AxiosResponse =
      await this.httpService.axiosRef.get(
        `${currencyApiUrlBase}${currencyApiUrlCurrencies}?apikey=${currencyApiAccessKey}&currencies=${ipApiDataCurrency}`,
      );
    const currencyApiCurrenciesData = currencyApiCurrenciesResponse.data;

    const currencyApiSymbol =
      currencyApiCurrenciesData.data[ipApiDataCurrency].symbol_native;
    return currencyApiSymbol;
  }

  async getCurrencyConvertionRate(
    currencyApiUrlBase: string,
    currencyApiAccessKey: string,
    ipApiDataCurrency: string,
  ): Promise<number> {
    const currencyApiUrlLatestRate: string = this.configService.get<string>(
      'currencyApiConfig.urlLatestRate',
    );

    const currencyApiLatestResponse: AxiosResponse =
      await this.httpService.axiosRef.get(
        `${currencyApiUrlBase}${currencyApiUrlLatestRate}?apikey=${currencyApiAccessKey}&base_currency=USD&currencies=${ipApiDataCurrency}`,
      );
    const currencyApiLatestData = currencyApiLatestResponse.data;

    const currencyApiLatestRate =
      currencyApiLatestData.data[ipApiDataCurrency].value;
    const currencyApiConversionRate = Number(
      (1 / currencyApiLatestRate).toFixed(6),
    );

    return currencyApiConversionRate;
  }

  async saveStatistics(statisticsData: StatisticsData): Promise<void> {
    await this.statisticsModel.create(statisticsData);
  }
}

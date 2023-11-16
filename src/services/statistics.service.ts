import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StatisticsDocument } from '../models/schemas/statistics.schema';
import { Formatter } from '../utils/formatter';
import { Statistics } from '../models/entities/statistics.entity';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(Statistics.name);
  constructor(
    @InjectModel(StatisticsDocument.name)
    private readonly statisticsModel: Model<StatisticsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private formatter: Formatter,
  ) {}
  async getStatistics(): Promise<Statistics> {
    const cacheKeyStatistics = 'statistics';
    const cacheResultStatistics =
      await this.cacheManager.get(cacheKeyStatistics);

    if (cacheResultStatistics) {
      // Log the result in mode debug
      this.logger.debug(
        `cacheResultStatistics: ${JSON.stringify(cacheResultStatistics)}`,
      );
      // If I find the statistics in cache, I return it
      return cacheResultStatistics as Statistics;
    }

    // Call the getLongestDistance method to get the longest distance
    const longestDistance = await this.getLongestDistance();
    // Call the getMostTracedCountry method to get the most traced country
    const mostTracedCountry = await this.getMostTracedCountry();

    const statistics: Statistics = {
      longest_distance: {
        country: this.formatter.capitalizeString(longestDistance.country),
        value: longestDistance.distanceToUsa,
      },
      most_traced: {
        country: this.formatter.capitalizeString(mostTracedCountry.country),
        value: mostTracedCountry.value,
      },
    };

    // Persist the statistics in the cache
    await this.cacheManager.set(cacheKeyStatistics, statistics);

    // Log the result in mode debug
    this.logger.debug(`statistics: ${JSON.stringify(statistics)}`);

    return statistics;
  }

  async getLongestDistance(): Promise<{
    country: string;
    distanceToUsa: number;
  }> {
    const longestDistance = await this.statisticsModel
      .findOne()
      .sort({ distanceToUsa: -1 })
      .select({ _id: 0, __v: 0, regionName: 0, city: 0 })
      .exec();

    if (!longestDistance) {
      throw new NotFoundException('No records found');
    }
    return longestDistance;
  }

  async getMostTracedCountry(): Promise<{ country: string; value: number }> {
    const mostTracedCountry = await this.statisticsModel
      .aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $project: { _id: 0, country: '$_id', value: '$count' } },
      ])
      .exec();

    if (!mostTracedCountry || mostTracedCountry.length === 0) {
      throw new NotFoundException('No records found');
    }
    return mostTracedCountry[0];
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';

import { StatisticsService } from '../../src/services/statistics.service';
import { StatisticsDocument } from '../../src/models/schemas/statistics.schema';
import { Formatter } from '../../src/utils/formatter';
import { Statistics } from '../../src/models/entities/statistics.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let cacheManager: Cache;
  let statisticsModel: Model<StatisticsDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getModelToken(StatisticsDocument.name),
          useValue: {
            findOne: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        Formatter,
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    statisticsModel = module.get<Model<StatisticsDocument>>(
      getModelToken(StatisticsDocument.name),
    );
  });

  describe('getStatistics', () => {
    it('should return statistics from cache if available', async () => {
      const cacheKeyStatistics = 'statistics';
      const cacheResultStatistics: Statistics = {
        longest_distance: {
          country: 'Thailand',
          value: 14094.72,
        },
        most_traced: {
          country: 'Argentina',
          value: 4,
        },
      };

      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(cacheResultStatistics);

      const result = await service.getStatistics();

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKeyStatistics);
      expect(result).toEqual(cacheResultStatistics);
    });

    it('should return statistics from database if not available in cache', async () => {
      const cacheKeyStatistics = 'statistics';
      const longestDistance = {
        country: 'Thailand',
        distanceToUsa: 14094.72,
      };
      const mostTracedCountry = {
        country: 'Argentina',
        value: 4,
      };
      const expectedStatistics: Statistics = {
        longest_distance: {
          country: 'Thailand',
          value: 14094.72,
        },
        most_traced: {
          country: 'Argentina',
          value: 4,
        },
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null);
      jest
        .spyOn(service, 'getLongestDistance')
        .mockResolvedValueOnce(longestDistance);
      jest
        .spyOn(service, 'getMostTracedCountry')
        .mockResolvedValueOnce(mostTracedCountry);
      jest.spyOn(cacheManager, 'set');

      const result = await service.getStatistics();

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKeyStatistics);
      expect(service.getLongestDistance).toHaveBeenCalled();
      expect(service.getMostTracedCountry).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        cacheKeyStatistics,
        expectedStatistics,
      );
      expect(result).toEqual(expectedStatistics);
    });
  });

  describe('getLongestDistance', () => {
    it('should return the longest distance from database', async () => {
      const longestDistance = {
        country: 'Thailand',
        distanceToUsa: 14094.72,
      };

      jest.spyOn(statisticsModel, 'findOne').mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(longestDistance),
      } as any);

      const result = await service.getLongestDistance();

      expect(statisticsModel.findOne).toHaveBeenCalled();
      expect(result).toEqual(longestDistance);
    });

    it('should throw a NotFoundException if no records are found', async () => {
      jest.spyOn(statisticsModel, 'findOne').mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.getLongestDistance()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMostTracedCountry', () => {
    it('should return the most traced country from database', async () => {
      const mostTracedCountry = {
        country: 'Argentina',
        value: 4,
      };

      jest.spyOn(statisticsModel, 'aggregate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([mostTracedCountry]),
      } as any);

      const result = await service.getMostTracedCountry();

      expect(statisticsModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mostTracedCountry);
    });

    it('should throw a NotFoundException if no records are found', async () => {
      jest.spyOn(statisticsModel, 'aggregate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.getMostTracedCountry()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

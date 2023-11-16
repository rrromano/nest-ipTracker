import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { StatisticsController } from '../../src/controllers/statistics.controller';
import { StatisticsService } from '../../src/services/statistics.service';
import { Statistics } from '../../src/models/entities/statistics.entity';

jest.mock('../../src/services/statistics.service');

describe('StatisticsController', () => {
  let statisticsController: StatisticsController;
  let statisticsService: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [StatisticsService],
    }).compile();

    statisticsController =
      module.get<StatisticsController>(StatisticsController);
    statisticsService = module.get<StatisticsService>(StatisticsService);
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const mockStatistics: Statistics = {
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
        .spyOn(statisticsService, 'getStatistics')
        .mockResolvedValueOnce(mockStatistics);

      const result = await statisticsController.getStatistics();

      expect(result).toEqual(mockStatistics);
    });

    it('should throw NotFoundException if statistics are not found', async () => {
      jest
        .spyOn(statisticsService, 'getStatistics')
        .mockRejectedValueOnce(new NotFoundException('No records found'));

      await expect(statisticsController.getStatistics()).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error if ocurre an error in getStatistics', async () => {
      jest
        .spyOn(statisticsService, 'getStatistics')
        .mockRejectedValueOnce(new Error('Error test'));

      await expect(statisticsController.getStatistics()).rejects.toThrow(Error);
    });
  });
});

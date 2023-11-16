import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { TracesController } from '../../src/controllers/traces.controller';
import { TracesService } from '../../src/services/traces.service';
import { Traces } from '../../src/models/entities/traces.entity';
import { TracesRequest } from '../../src/models/dtos/traceRequest.dto';

jest.mock('../../src/services/traces.service');

describe('TracesController', () => {
  let tracesController: TracesController;
  let tracesService: TracesService;
  const mockTracesRequest: TracesRequest = { ip: '190.193.92.69' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracesController],
      providers: [TracesService],
    }).compile();

    tracesController = module.get<TracesController>(TracesController);
    tracesService = module.get<TracesService>(TracesService);
  });

  describe('getTracesInfo', () => {
    it('should return traces', async () => {
      const mockTraces: Traces = {
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

      jest
        .spyOn(tracesService, 'getTracesInfo')
        .mockResolvedValueOnce(mockTraces);

      const result = await tracesController.getTracesInfo(mockTracesRequest);

      expect(result).toEqual(mockTraces);
    });

    it('should throw BadRequestException if ocurre an error in getTracesInfo with getIpInfo', async () => {
      jest
        .spyOn(tracesService, 'getTracesInfo')
        .mockRejectedValueOnce(new BadRequestException('Bad request test'));

      await expect(
        tracesController.getTracesInfo(mockTracesRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw Error if ocurre an error in getTracesInfo', async () => {
      jest
        .spyOn(tracesService, 'getTracesInfo')
        .mockRejectedValueOnce(new Error('Error test'));

      await expect(
        tracesController.getTracesInfo(mockTracesRequest),
      ).rejects.toThrow(Error);
    });
  });
});

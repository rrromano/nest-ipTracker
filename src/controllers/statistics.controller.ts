import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { StatisticsService } from '../services/statistics.service';
import { Statistics } from '../models/entities/statistics.entity';
import { ErrorResponse } from '../models/entities/errorResponse.entity';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Get Statistics', type: Statistics })
  @ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponse })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorResponse,
  })
  async getStatistics(): Promise<Statistics> {
    return this.statisticsService.getStatistics();
  }
}

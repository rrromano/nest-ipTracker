import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { TracesRequest } from '../models/dtos/traceRequest.dto';
import { TracesService } from '../services/traces.service';
import { Traces } from '../models/entities/traces.entity';
import { ErrorResponse } from '../models/entities/errorResponse.entity';

@ApiTags('Traces')
@Controller('traces')
export class TracesController {
  constructor(private readonly tracesService: TracesService) {}

  @Post()
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'Get Traces', type: Traces })
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    type: ErrorResponse,
  })
  async getTracesInfo(@Body() tracesRequest: TracesRequest): Promise<Traces> {
    return this.tracesService.getTracesInfo(tracesRequest.ip);
  }
}

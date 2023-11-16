import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorResponse } from '../models/entities/errorResponse.entity';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode: number = 500;
    let message: string;
    let code: string = 'InternalServerError';
    let stack: string;

    if (exception instanceof HttpException) {
      const httpException: HttpException = exception as HttpException;
      statusCode = httpException.getStatus();
      message =
        httpException.getResponse() && httpException.getResponse()['message']
          ? httpException.getResponse()['message'].toString()
          : httpException.message;
      code = httpException.name;
      stack = httpException.stack;
    } else {
      const errorException: Error = exception as Error;
      message = errorException.message;
      stack = errorException.stack;
    }

    const responseBody: ErrorResponse = {
      statusCode,
      message,
      error: {
        code,
        stack,
        timestamp: new Date().toISOString(),
      },
    };

    // Log the error in mode error
    this.logger.error(message, stack);

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}

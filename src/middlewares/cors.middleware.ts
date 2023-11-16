import { NestMiddleware, Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = this.configService.get<string[]>(
      'appConfig.whiteListOrigin',
    );
    const origin = req.headers.origin;

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      next();
    } else {
      throw new ForbiddenException('Origin not allowed by CORS policy');
    }
  }
}

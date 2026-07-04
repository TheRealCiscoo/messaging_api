import { ForbiddenException, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { requests } from 'src/common/interfaces/rate-limit.interface';

export class RateLimiterMiddleware implements NestMiddleware {
  private logger = new Logger('RateLimiterMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const sourceIP = req.ip;
    const destinationEndpoint = req.originalUrl;
    const searchParam = `${sourceIP}_${destinationEndpoint}`;
    const currentRate = requests.get(searchParam);

    const DURATION_TIME = 1000 * 20;
    const MAX_RATE = 6;

    if (!currentRate) {
      requests.set(searchParam, {
        count: 1,
        expireAt: new Date().getTime() + DURATION_TIME,
      });
    } else {
      if (
        currentRate.count > MAX_RATE &&
        new Date().getTime() <= currentRate.expireAt
      ) {
        this.logger.fatal(`${sourceIP} has reached the rate limit.`);
        throw new ForbiddenException(
          'You have reached the rate limit of request. Try later.',
        );
      } else if (new Date().getTime() > currentRate.expireAt) {
        requests.set(searchParam, {
          count: 1,
          expireAt: new Date().getTime() + DURATION_TIME,
        });
      } else {
        requests.set(searchParam, {
          count: currentRate.count + 1,
          expireAt: currentRate.expireAt,
        });
      }
    }
    return next();
  }
}

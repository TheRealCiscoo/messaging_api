import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

import { RateLimiterMiddleware } from './common/middlewares/rate-limiter.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 20000,
          limit: 8,
        },
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        appName: config.get<string>('MONGO_APP_DB'),
        dbName: config.get<string>('MONGO_AUTH_DB'),
      }),
    }),
    AuthModule,
    ChatModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes({ path: 'auth/private', method: RequestMethod.ALL }); // I have implemented this rate-limiting middleware to learn how to create a simple rate limit, but I would strongly recommend using the Throttler library instead.
  }
}

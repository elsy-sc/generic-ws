import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DEFAULT_JWT_SECRET } from './util/constante.util';
import controllers from './controller/index.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    }),
  ],
  controllers: controllers,
  providers: [],
})
export class AppModule {}

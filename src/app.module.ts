import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenController } from './controller/gen.controller';
import { JwtModule } from '@nestjs/jwt';
import { DEFAULT_JWT_SECRET } from './util/constante.util';

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
  controllers: [GenController],
  providers: [],
})
export class AppModule {}

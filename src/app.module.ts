import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenController } from './controller/gen.controller';
import { MetaController } from './controller/meta.controller';
import { JwtModule } from '@nestjs/jwt';
import { DEFAULT_JWT_SECRET } from './util/constante.util';
import { AuthController } from './controller/auth.controller';
import { TokenController } from './controller/token.controller';

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
  controllers: [GenController, MetaController, AuthController, TokenController],
  providers: [],
})
export class AppModule {}

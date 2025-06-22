import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenController } from './controller/gen.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [GenController],
  providers: [],
})
export class AppModule {}

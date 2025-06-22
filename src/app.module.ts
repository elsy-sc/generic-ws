import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenController } from './controller/gen.controller';
import { MetaController } from './controller/meta.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [GenController, MetaController],
  providers: [],
})
export class AppModule {}

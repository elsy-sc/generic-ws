import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { NetworkUtil } from './util/network.util';
import { BootstrapUtil } from './util/bootstrap.util';
import { DEFAULT_APP_PORT } from './util/constante.util';
import { CorsUtil } from './util/cors.util';
import { registerRouteAliases } from './middleware/alias.middleware';
const { version } = require('@nestjs/core/package.json');

async function bootstrap() {
  const start = Date.now();
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  CorsUtil.enableCors(app);

  await registerRouteAliases(app);
  
  const port = process.env.PORT ? process.env.PORT : DEFAULT_APP_PORT;
  await app.listen(port, '0.0.0.0');
  
  const networkIP = NetworkUtil.getLocalNetworkIp() ?? undefined;
  
  BootstrapUtil.logStartupInfo(start, port, networkIP, version);
}
bootstrap();

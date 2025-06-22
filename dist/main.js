"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const network_util_1 = require("./util/network.util");
const bootstrap_util_1 = require("./util/bootstrap.util");
const { version } = require('@nestjs/core/package.json');
async function bootstrap() {
    const start = Date.now();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    const networkIP = network_util_1.NetworkUtil.getLocalNetworkIp() ?? undefined;
    bootstrap_util_1.BootstrapUtil.logStartupInfo(start, port, networkIP, version);
}
bootstrap();
//# sourceMappingURL=main.js.map
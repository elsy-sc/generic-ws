"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkUtil = void 0;
const os_1 = require("os");
class NetworkUtil {
    static getLocalNetworkIp() {
        const networks = (0, os_1.networkInterfaces)();
        const networkIP = Object.values(networks)
            .flat()
            .find(net => net?.family === 'IPv4' && !net.internal)?.address;
        return networkIP || null;
    }
}
exports.NetworkUtil = NetworkUtil;
//# sourceMappingURL=network.util.js.map
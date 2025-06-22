import { networkInterfaces } from "os";

export class NetworkUtil {
    static getLocalNetworkIp(): string | null {
        const networks = networkInterfaces();
        const networkIP = Object.values(networks)
            .flat()
            .find(net => net?.family === 'IPv4' && !net.internal)?.address;
        return networkIP || null;
    }

}
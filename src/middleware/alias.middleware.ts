import httpProxy from '@fastify/http-proxy';
import { DEFAULT_UPSTREAM_URL } from 'src/util/constante.util';
import { ROUTES } from 'src/util/routeAlias.util';

export async function registerRouteAliases(app: any) {
    const upstream = process.env.UPSTREAM_URL || DEFAULT_UPSTREAM_URL;
    for (const [routeKey, aliases] of Object.entries(ROUTES)) {
        const [method, pathWithQuery] = routeKey.split(' ');
        const [path, queryString] = pathWithQuery.split('?');
        if (Array.isArray(aliases)) {
            for (const alias of aliases) {
                const proxyOptions: any = {
                    upstream,
                    prefix: alias,
                    httpMethods: [method],
                };
                if (queryString) {
                    proxyOptions.rewritePrefix = null;
                    proxyOptions.preHandler = async (req, reply) => {
                        let targetUrl = path;
                        const originalQuery = req.raw.url.includes('?') ? req.raw.url.split('?')[1] : '';
                        if (queryString && originalQuery) {
                            targetUrl += '?' + queryString + '&' + originalQuery;
                        } else if (queryString) {
                            targetUrl += '?' + queryString;
                        } else if (originalQuery) {
                            targetUrl += '?' + originalQuery;
                        }
                        req.raw.url = targetUrl;
                    };
                } else {
                    proxyOptions.rewritePrefix = path;
                }
                await app.register(httpProxy, proxyOptions);
            }
        }
    }
}
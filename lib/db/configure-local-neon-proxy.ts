import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * Route Neon serverless driver traffic through a local HTTP/WebSocket proxy
 * (e.g. ghcr.io/timowilhelm/local-neon-http-proxy) when talking to Postgres in CI.
 *
 * Set NEON_LOCAL_PROXY_PORT (and optionally NEON_LOCAL_PROXY_HOST) in the environment.
 */
export function configureLocalNeonProxy(): void {
  const proxyPort = process.env.NEON_LOCAL_PROXY_PORT;
  if (!proxyPort) {
    return;
  }

  const proxyHost = process.env.NEON_LOCAL_PROXY_HOST ?? "127.0.0.1";

  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = false;
  neonConfig.wsProxy = () => `${proxyHost}:${proxyPort}/v1`;
  neonConfig.fetchEndpoint = () => `http://${proxyHost}:${proxyPort}/sql`;
}

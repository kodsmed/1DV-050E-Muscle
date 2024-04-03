import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { getLoadContext } from "./load-context";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remixCloudflareDevProxy({ getLoadContext: getLoadContext }),
    remix(),
    tsconfigPaths(),
  ],
});

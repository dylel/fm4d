import { defineConfig } from "@trigger.dev/sdk";
import { aptGet } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  dirs: ["./src"],
  maxDuration: 2 * 60 * 1000, // 2 minutes
  runtime: "node",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    external: [
      "gdal-async",
      "@mapbox/node-pre-gyp",
    ],
    extensions: [
      aptGet({ 
        packages: [
          "libgdal-dev", // Required for gdal-async
          "libpoppler-dev", // Required for PDF driver support in GDAL
        ] 
      }),
    ],
  },
});


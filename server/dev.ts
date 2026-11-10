import { serve } from "@hono/node-server";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 8787);
const server = serve(
  { fetch: createApp().fetch, port, hostname: "127.0.0.1" },
  () => {
    console.info(`Private coach listening at http://127.0.0.1:${port}`);
  },
);
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());

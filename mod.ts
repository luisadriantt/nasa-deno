import { Application, send } from "https://deno.land/x/oak/mod.ts";
import * as log from "https://deno.land/std@0.92.0/log/mod.ts";

import api from "./api.ts";

const app = new Application();
const PORT = 8000;

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

// Middelwares
app.use(async (ctx, next) => {
  // Catch any errors
  try {
    await next();
  } catch (err) {
    ctx.response.body = "Internal server error";
    throw err;
  }
});

app.addEventListener("error", (event) => {
  log.error(event.error);
});

app.use(async (ctx, next) => {
  await next();
  // Right after next, we can use de info of the next middelware
  const time = ctx.response.headers.get("X-Response-Time");
  log.info(`${ctx.request.method} ${ctx.request.url} ${time}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${delta}ms`);
});

app.use(api.routes());
app.use(api.allowedMethods());

app.use(async (ctx) => {
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/index.html",
    "/javascripts/script.js",
    "/stylesheets/style.css",
    "/images/favicon.png",
  ];
  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

// Run app
if (import.meta.main) {
  log.info(`STARTING SERVER ON PORT ${PORT}!!!`);
  await app.listen({
    port: PORT,
  });
}

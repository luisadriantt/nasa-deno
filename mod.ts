import { Application, send } from "https://deno.land/x/oak/mod.ts";

import api from "./api.ts";

const app = new Application();
const PORT = 8000;

// Middelwares
app.use(api.routes());

app.use(async (ctx, next) => {
  await next();
  // Right after next, we can use de info of the next middelware
  const time = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} ${time}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${delta}ms`);
});

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
  await app.listen({
    port: PORT,
  });
}

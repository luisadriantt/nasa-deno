import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const PORT = 8000;

// Middelwares
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

app.use((ctx) => {
  ctx.response.body = "jelou";
});

// Run app
if (import.meta.main) {
  await app.listen({
    port: PORT,
  });
}

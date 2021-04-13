import { Router } from "./deps.ts";

import * as planets from "./models/planets.ts";
import * as launches from "./models/launches.ts";

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "jelou";
});

router.get("/planets", (ctx) => {
  ctx.response.body = planets.getAllPlanets();
});

router.get("/launches", (ctx) => {
  ctx.response.body = launches.getAll();
});

router.get("/launches/:id", (ctx) => {
  if (ctx.params?.id) {
    const launchesList = launches.getOne(Number(ctx.params.id));
    if (launchesList) {
      ctx.response.body = launchesList;
    } else {
      ctx.throw(400, "Id does not exists");
    }
  }
});

router.post("/launches", async (ctx) => {
  try {
    const body = await ctx.request.body();
    const data = (body.value as unknown) as launches.LaunchInterface;

    launches.addOne(await data);

    ctx.response.body = { success: true };
    ctx.response.status = 201;
  } catch (err) {
    console.log(err);
  }
});

router.delete("/launches/:id", (ctx) => {
  if (ctx.params?.id) {
    const result = launches.deleteOne(Number(ctx.params.id));
    ctx.response.body = { succes: result };
  }
});

export default router;

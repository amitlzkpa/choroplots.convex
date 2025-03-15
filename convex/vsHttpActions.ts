import * as https from "https";
import { action, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const mapCreate = httpAction(async (ctx, request) => {

  const { text } = await request.json();

  console.log(text);

  const mapId = await ctx.runMutation(internal.dbOps.createNewMap, {
    text,
  });

  console.log(mapId);

  return new Response("Yessire!", {
    status: 200,
  });
});


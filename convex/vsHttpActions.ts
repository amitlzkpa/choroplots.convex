import * as https from "https";
import { action, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const mapCreate = httpAction(async (ctx, request) => {

  const { text } = await request.json();

  const map = await ctx.runAction(api.vsActions.mapCreate, {
    text,
  });

  return new Response("Yessire!", {
    status: 200,
  });
});


import * as https from "https";
import { action, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const foo = httpAction(async (ctx, request) => {

  // if (request.method === "OPTIONS") {
  //   return new Response(null, {
  //     status: 204,
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  //       "Access-Control-Allow-Headers": "Content-Type",
  //     },
  //   });
  // }


  const { text } = await request.json();

  console.log(text);

  // const mapId = await ctx.runMutation(internal.dbOps.createNewMap, {
  //   text,
  // });

  // console.log(mapId);

  return new Response("Yessire!", {
    status: 200,
  });
});


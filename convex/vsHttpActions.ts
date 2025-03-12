import * as https from "https";
import { action, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const foo = httpAction(async (ctx, request) => {

  return new Response("Hello world!", {
    status: 200,
  });
});

export const mapCreate = httpAction(async (ctx, request) => {

  console.log("foo");

  return new Response("Yessire!", {
    status: 200,
  });
});


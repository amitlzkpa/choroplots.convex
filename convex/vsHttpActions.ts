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

export const generateUploadUrl = httpAction(async (ctx, request) => {

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Only POST requests are supported", { status: 405 });
  }

  const uploadUrl = await ctx.storage.generateUploadUrl();

  return new Response(JSON.stringify({ uploadUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});

export const createStoredFile = httpAction(async (ctx, request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Only POST requests are supported", { status: 405 });
  }

  const { cvxStoredFileId, subreddit, username, postId } = await request.json();

  const storedFileId = await ctx.runMutation(internal.dbOps.createNewStoredFileFromHttp, {
    cvxStoredFileId,
    subreddit,
    username,
    postId
  });

  return new Response(JSON.stringify({ storedFileId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
});

export const generateArticleStatements = httpAction(async (ctx, request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Only POST requests are supported", { status: 405 });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
});


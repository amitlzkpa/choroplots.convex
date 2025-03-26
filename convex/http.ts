import { httpRouter } from "convex/server";
import { foo, createStoredFile, generateArticleStatements, generateArticleTopics, generateUploadUrl, generateArticle } from "./vsHttpActions";

const http = httpRouter();

http.route({
  path: "/api/foo",
  method: "POST",
  handler: foo,
});

http.route({
  path: "/api/generateUploadUrl",
  method: "POST",
  handler: generateUploadUrl,
});

http.route({
  path: "/api/createStoredFile",
  method: "POST",
  handler: createStoredFile,
});

http.route({
  path: "/api/generateArticleStatements",
  method: "POST",
  handler: generateArticleStatements,
});

http.route({
  path: "/api/generateArticleTopics",
  method: "POST",
  handler: generateArticleTopics,
});

http.route({
  path: "/api/generateArticle",
  method: "POST",
  handler: generateArticle,
});

export default http;
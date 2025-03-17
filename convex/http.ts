import { httpRouter } from "convex/server";
import { foo, createStoredFile, generateArticleStatements, generateUploadUrl } from "./vsHttpActions";

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

export default http;
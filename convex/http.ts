import { httpRouter } from "convex/server";
import { createStoredFile, foo, generateUploadUrl } from "./vsHttpActions";

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

export default http;
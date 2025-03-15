import { httpRouter } from "convex/server";
import { foo, generateUploadUrl } from "./vsHttpActions";

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

export default http;
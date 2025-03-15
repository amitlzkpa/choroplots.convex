import { httpRouter } from "convex/server";
import { foo } from "./vsHttpActions";

const http = httpRouter();

http.route({
  path: "/api/foo",
  method: "POST",
  handler: foo,
});

export default http;
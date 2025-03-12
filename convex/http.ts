import { httpRouter } from "convex/server";
import { foo } from "./vsHttpActions";

const http = httpRouter();


http.route({
  path: "/foo",
  method: "GET",
  handler: foo,
});

export default http;
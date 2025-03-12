import { httpRouter } from "convex/server";
import { foo, mapCreate } from "./vsHttpActions";

const http = httpRouter();


http.route({
  path: "/foo",
  method: "GET",
  handler: foo,
});


http.route({
  path: "/api/maps/create",
  method: "POST",
  handler: mapCreate,
});

export default http;
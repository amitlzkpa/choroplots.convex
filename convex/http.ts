import { httpRouter } from "convex/server";
import { mapCreate } from "./vsHttpActions";

const http = httpRouter();

http.route({
  path: "/api/maps/create",
  method: "POST",
  handler: mapCreate,
});

export default http;
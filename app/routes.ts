import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("employees/new", "routes/employees.new.tsx"),
    route("employees/:id", "routes/employees.$id.tsx"),
    route("employees/:id/edit", "routes/employees.$id.edit.tsx"),
  ]),
] satisfies RouteConfig;

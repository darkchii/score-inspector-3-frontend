import { createBrowserRouter } from "react-router";
import RouteIndex from "./routes/RouteIndex";

createBrowserRouter([
    {
        path: "/",
        Component: RouteIndex,
    }
])
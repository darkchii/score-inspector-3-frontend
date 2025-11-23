import { createBrowserRouter } from "react-router";
import RouteIndex from "./Routes/RouteIndex";

createBrowserRouter([
    {
        path: "/",
        Component: RouteIndex,
    }
])
import { Box } from "@mui/material"
import { Route, Routes, useSearchParams } from "react-router";
import { useAuth } from "./providers/AuthProvider";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RouteIndex from "./routes/RouteIndex";
import RouteProfile from "./routes/RouteProfile";
import Route404 from "./routes/Route404";
import RouteScoreRank from "./routes/RouteScoreRank";
import RouteCompletionists from "./routes/RouteCompletionists";
import RouteLeaderboards from "./routes/RouteLeaderboards";
import RoutePeople from "./routes/RoutePeople";
import RouteTools from "./routes/RouteTools";
import type { IRouteObject } from "./types/types";
import RouteBeatmapset from "./routes/RouteBeatmapset";
import { routeData } from "./util/RouteHelper";
import RouteBeatmaps from "./routes/RouteBeatmaps";
import RouteAdmin from "./routes/RouteAdmin";

declare const window: any; //ts fix
function App() {
  const [title, setTitle] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  window.onTitleChange = (title: string) => {
    setTitle(title);
  }

  const routes = [
    { path: routeData.route404.path, element: <Route404 /> },
    { path: routeData.routeIndex.path, element: <RouteIndex /> },
    { path: routeData.routePeople.path, element: <RoutePeople /> },
    { path: routeData.routeTools.path, element: <RouteTools /> },
    { path: routeData.routeProfile.path, element: <RouteProfile /> },
    { path: routeData.routeScoreRank.path, element: <RouteScoreRank /> },
    { path: routeData.routeCompletionists.path, element: <RouteCompletionists /> },
    { path: routeData.routeLeaderboards.path, element: <RouteLeaderboards /> },
    { path: routeData.routeAdmin.path, element: <RouteAdmin /> },
    { path: routeData.routeBeatmaps.path, element: <RouteBeatmaps /> },
    { path: routeData.routeBeatmapsets.path, element: <RouteBeatmapset /> },
  ];

  const getRoute = (obj: IRouteObject, is_child = false) => {
    return <>
      {
        is_child && <Route
          // onTitleChange={(title) => setTitle(title)}
          index
          element={obj.element}
        />
      }
      <Route
        key={obj.path}
        path={obj.path}
        element={obj.element}
      >
        {
          obj.children && obj.children.map((child) => getRoute(child, true))
        }
      </Route>
    </>
  }

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      (async () => {
        //todo
        console.log(`Attempting to login with code: ${code}`);
        try {
          await login(code);
          //remove code from url
          window.history.replaceState({}, document.title, window.location.pathname);
          // ShowNotification("Login successful!", "success");
        } catch (error) {
          console.error("Login error:", error);
          // ShowNotification("Login failed. Please try again.", "error");
        }
      })();
    }
  }, [searchParams]);

  return (
    <React.Fragment>
      <ToastContainer />
      <Box>
        <Header />
      </Box>
      <Routes>
        {
          routes.map((route) => getRoute(route))
        }
      </Routes>
      <Footer />
    </React.Fragment>
  )
}

export default App

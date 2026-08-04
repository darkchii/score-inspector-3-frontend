import { Box, Divider, Button } from "@mui/material"
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
import type { IConfig, IRouteObject } from "./types/types";
import RouteBeatmapset from "./routes/RouteBeatmapset";
import { routeData } from "./util/RouteHelper";
import RouteBeatmaps from "./routes/RouteBeatmaps";
import RouteAdmin from "./routes/RouteAdmin";
import RouteTeam from "./routes/RouteTeam";
import { useApi } from "./providers/ApiProvider";
import ErrorIcon from '@mui/icons-material/Error';
import Config from "./data/Config.json";

const typedConfig: IConfig = Config;

declare const window: any; //ts fix
function App() {
  const [title, setTitle] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { getServerInfo } = useApi();
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(true); //so it doesn't flash the downtime message on first load
  const [serverDownCause, setServerDownCause] = useState<string | null>(null);

  useEffect(() => {
    (async() => {
      try {
        const serverInfo = await getServerInfo();
        setIsServerOnline(serverInfo.altDbAccessible);
        if(!serverInfo.altDbAccessible) {
          setServerDownCause("osu! alternative database is down. Please try again later.");
        }
      }catch (error) {
        console.error("Error fetching server info:", error);
        setIsServerOnline(false);
        setServerDownCause("osu! score inspector server is down. Please try again later.");
      }
    })();
  }, [getServerInfo]);

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
    { path: routeData.routeTeam.path, element: <RouteTeam /> },
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

  if(!isServerOnline || serverDownCause) {
    return (
      //full screen downtime message, modern design with an large centered icon and text
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 2 }}>
        <ErrorIcon sx={{ fontSize: 100, mb: 2 }} color="error" />
        <h1>Server is down</h1>
        <p>{serverDownCause}</p>
        <Divider sx={{ my: 2 }} />
        {/* discord join button */}
        <Button variant="contained" color="primary" href={typedConfig.DISCORD_URL} target="_blank">
          Join the osu!alternative Discord
        </Button>
      </Box>
    )
  }

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

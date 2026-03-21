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
import RouteScore from "./routes/RouteScore";
import RouteCompletionists from "./routes/RouteCompletionists";
import RouteLeaderboards from "./routes/RouteLeaderboards";
import RoutePeople from "./routes/RoutePeople";
import RouteTools from "./routes/RouteTools";
import type { IRouteObject } from "./types/types";

declare const window: any; //ts fix
function App() {
  const [title, setTitle] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  window.onTitleChange = (title: string) => {
    setTitle(title);
  }

  const routes = [
    { path: "*", element: <Route404 /> },
    { path: "/", element: <RouteIndex /> },
    { path: "/people", element: <RoutePeople /> },
    { path: "/tools/:tool?", element: <RouteTools /> },
    { path: "/user/:userId/:ruleset?/:page?", element: <RouteProfile /> },
    { path: "/score/:ruleset?/:stat?/:date?/page?/:page?", element: <RouteScore /> },
    { path: "/completionists", element: <RouteCompletionists /> },
    { path: "/leaderboards/:ruleset?/:statistic?/page?/:page?/country?/:country?", element: <RouteLeaderboards /> },
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

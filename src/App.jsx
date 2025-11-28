import { Box, CardContent, createTheme, CssBaseline, Paper, ThemeProvider } from "@mui/material"
import { Route, Routes, useSearchParams } from "react-router";
import { useAuth } from "./Providers/AuthProvider";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import RouteIndex from "./Routes/RouteIndex";
import RouteProfile from "./Routes/RouteProfile";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Route404 from "./Routes/Route404";
import { pink } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: pink[500],
      light: pink[300],
      dark: pink[700],
    },
  }
});

function App() {
  const [title, setTitle] = useState(null);
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  window.onTitleChange = (title) => {
    setTitle(title);
  }

  const routes = [
    { path: "*", element: <Route404 /> },
    { path: "/", element: <RouteIndex /> },
    { path: "/user/:userId/:ruleset?/:page?", element: <RouteProfile /> },

  ];

  const getRoute = (obj, is_child = false) => {
    return <>
      {
        is_child && <Route
          onTitleChange={(title) => setTitle(title)}
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer />
      <Box>
        <Header />
      </Box>
      {/* <Paper elevation={2}> */}
      {/* <CardContent> */}
      <Routes>
        {
          routes.map((route) => getRoute(route))
        }
      </Routes>
      {/* </CardContent> */}
      {/* </Paper> */}
      <Footer />
    </ThemeProvider>
  )
}

export default App

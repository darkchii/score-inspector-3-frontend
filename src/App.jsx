import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"
import BasePage from "./Components/BasePage";
import { useSearchParams } from "react-router";
import { useAuth } from "./Providers/AuthProvider";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if(code) {
      (async () => {
        //todo
        console.log(`Attempting to login with code: ${code}`);
        try{
          await login(code);
        }catch(error){
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
      <BasePage />
    </ThemeProvider>
  )
}

export default App

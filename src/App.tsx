import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { Global, css } from "@emotion/react";

const queryClient = new QueryClient();

// Your cosmic romantic "planet-like" background
const gradientBackground = css`
  body {
    min-height: 100vh;
    background: radial-gradient(
      ellipse 110% 50% at 50% 25%,
      #ea4cff 0%,
      #ffb7ef 40%,
      #302446 100%
    );
    background-attachment: fixed;
    animation: gradientMove 10s ease-in-out infinite alternate;
  }

  @keyframes gradientMove {
    0% {
      background-position: 50% 40%;
    }
    100% {
      background-position: 46% 30%;
    }
  }
`;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ea4cff" },
    secondary: { main: "#ffb7ef" },
    background: {
      default: "transparent",
      paper: "rgba(45,27,71,0.88)",
    },
    info: { main: "#d72660" },
    warning: { main: "#ffd700" },
  },
  typography: {
    fontFamily: "'Quicksand', 'Montserrat', 'Roboto', sans-serif",
    h1: { fontWeight: 900, letterSpacing: 1, fontFamily: "Montserrat" },
    h2: { fontWeight: 900, fontFamily: "Montserrat" },
    h3: { fontWeight: 700, fontFamily: "Montserrat" },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          fontWeight: 700,
          textTransform: "none",
          fontSize: 18,
          backgroundImage:
            "linear-gradient(90deg,#ea4cff 0%,#ffb7ef 51%,#ffd700 100%)",
          boxShadow: "0 6px 32px #ea4cff55",
          transition: "0.15s box-shadow",
          ":hover": {
            boxShadow: "0 12px 36px #ea4cff85",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(45,27,71,0.98)",
          backdropFilter: "blur(2px)",
          borderRadius: 20,
          boxShadow: "0 2px 16px #ea4cff22",
        },
      },
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Global styles={gradientBackground} />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

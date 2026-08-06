import { createRoot } from "react-dom/client";
import { AppRouter } from "./routes/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AppRouter />
  </ThemeProvider>
);
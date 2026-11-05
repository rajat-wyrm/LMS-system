import { createRoot } from "react-dom/client";
import { AppRouter } from "./routes/AppRouter";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouter />);
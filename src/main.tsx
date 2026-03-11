
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./styles/theme.scss";
import "./styles/components.scss";

createRoot(document.getElementById("root")!).render(<App />);

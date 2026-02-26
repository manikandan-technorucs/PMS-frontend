
import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/assets/styles/globals.css";
import "@/assets/styles/theme.scss";
import "@/assets/styles/components.scss";

createRoot(document.getElementById("root")!).render(<App />);

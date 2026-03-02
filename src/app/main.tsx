
import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/assets/styles/globals.css";
import "@/assets/styles/theme.scss";
import "@/assets/styles/components.scss";
import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

createRoot(document.getElementById("root")!).render(<App />);

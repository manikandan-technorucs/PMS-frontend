
import { createRoot } from"react-dom/client";
import App from"./App";
import"@/styles/globals.css";
import"@/styles/theme.scss";
import"@/styles/components.scss";
import"primereact/resources/themes/lara-light-teal/theme.css";
import"primereact/resources/primereact.min.css";
import"primeicons/primeicons.css";

createRoot(document.getElementById("root")!).render(<App />);

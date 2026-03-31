import { createRoot } from "react-dom/client";
import App from "./App";

/*
 * CSS Import Order — CRITICAL FOR PRODUCTION BUNDLE CSS CASCADE
 * ─────────────────────────────────────────────────────────────────────
 * 1. PrimeReact     Theme + core + icons — Loaded first (lowest priority)
 * 2. globals.css    Tailwind v4 (@layer base/utilities) — Preflight resets
 * 3. theme.scss     Design tokens (:root vars) — Custom design system
 * 4. components.scss SASS component overrides — Loaded Last (Wins globally)
 * ─────────────────────────────────────────────────────────────────────
 */

// 1. Vendor CSS (PrimeReact)
import "primereact/resources/themes/lara-light-teal/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// 2. Base Tailwind & Fonts
import "@/styles/globals.css";

// 3. Custom Theming & Component Overrides
import "@/styles/theme.scss";
import "@/styles/components.scss";

createRoot(document.getElementById("root")!).render(<App />);

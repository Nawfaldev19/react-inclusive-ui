import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, ToastProvider } from "../../src";
import { App } from "./App";
// Mirrors how an app imports the published stylesheet ("inclusive-ui/styles.css").
import "../../src/tokens/tokens.css";
import "../../src/styles/components.css";
import "./site.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);

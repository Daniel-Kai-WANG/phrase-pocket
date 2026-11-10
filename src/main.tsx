import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/navigation.css";
import "./styles/layout.css";
import "./styles/scene-palettes.css";
import "./styles/scenes.css";
import "./styles/components.css";
import "./styles/practice.css";
import "./styles/phonetics.css";
import "./styles/mobile.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

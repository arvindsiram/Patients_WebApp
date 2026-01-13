import { createRoot, Root } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;

// Use window to persist root across hot module reloads
declare global {
  interface Window {
    __reactRoot?: Root;
  }
}

let root: Root;

if (window.__reactRoot) {
  // Root already exists, reuse it
  root = window.__reactRoot;
} else {
  // Create new root and store it
  root = createRoot(container);
  window.__reactRoot = root;
}

root.render(<App />);

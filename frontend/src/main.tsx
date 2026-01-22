import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found in DOM");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="
      padding: 40px; 
      color: #ff6b6b; 
      font-family: monospace; 
      background: #1a1a1a; 
      min-height: 100vh;
      overflow-y: auto;
    ">
      <h1 style="color: #ff8787;">Error Loading App</h1>
      <p>Check the browser console (F12) for details.</p>
      <pre style="
        background: #0a0a0a; 
        padding: 20px; 
        border-radius: 8px; 
        overflow-x: auto;
        border: 1px solid #ff6b6b;
      ">${errorMessage}\n\n${error instanceof Error ? error.stack : ''}</pre>
      <p style="margin-top: 20px; color: #aaa;">Try refreshing the page or clearing browser cache.</p>
    </div>
  `;
}


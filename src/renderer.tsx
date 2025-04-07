import { createRoot } from "react-dom/client";
import { App } from "./App";
import { start } from "tone";

// The root container for the application.
const container = document.getElementById("root");
if (!container) throw new Error("Root not found.");

// Initialize the audio context when the user presses their mouse.
container.addEventListener("mousedown", start, { once: true });

// Create the root and render the app.
const root = createRoot(container);
root.render(<App />);

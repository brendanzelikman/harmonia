import ReactDOM from "react-dom/client";
import { App } from "./App";
import { start as startAudioContext } from "tone";
import "./renderer.css";

/** The root container for the application. */
const container = document.getElementById("root");

/** Initialize the audio context when the user presses an input. */
const initializeContext = () => {
  startAudioContext();
  container?.removeEventListener("mousedown", initializeContext);
  container?.removeEventListener("keydown", initializeContext);
};

/** Render the application within the root if there are no children. */
if (container && !container?.children.length) {
  container.addEventListener("keydown", initializeContext);
  container.addEventListener("mousedown", initializeContext);
  ReactDOM.createRoot(container).render(<App />);
}

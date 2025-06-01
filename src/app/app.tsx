import { start } from "tone";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "app/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LazyMotion, domAnimation } from "framer-motion";
import _ from "lodash";
import { useProjects } from "hooks/useProjects";
import { AppRouter } from "./router";

// The root container for the application.
const container = document.getElementById("root");
if (!container) throw new Error("Root not found.");

// Initialize the audio context when the user presses their mouse.
container.addEventListener("mousedown", start, { once: true });

// Pass lodash to the global window object for access within scripts.
window._ = _;

// Create the root and render the app when the DOM is ready.
const root = createRoot(container);
document.addEventListener("DOMContentLoaded", () => {
  root.render(<App />);
});

// The app handles routes and sets up the projects
function App() {
  const isLoaded = useProjects();
  if (!isLoaded) return null;
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <LazyMotion features={domAnimation}>
          <AppRouter />
        </LazyMotion>
      </DndProvider>
    </Provider>
  );
}

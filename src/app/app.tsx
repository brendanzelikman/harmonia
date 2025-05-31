import { start } from "tone";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "app/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LazyMotion, domAnimation } from "framer-motion";
import { router } from "app/router";
import { RouterProvider } from "react-router-dom";
import _ from "lodash";
import { useProjects } from "hooks/useProjects";
import { useTitle } from "hooks/useTitle";

// The root container for the application.
const container = document.getElementById("root");
if (!container) throw new Error("Root not found.");

// Initialize the audio context when the user presses their mouse.
container.addEventListener("mousedown", start, { once: true });

// Pass lodash to the global window object for access within scripts.
window._ = _;

// Create the root and render the app.
const root = createRoot(container);
document.addEventListener("DOMContentLoaded", () => {
  root.render(<App />);
});

// The main app handles routes and sets up a connection to the database
function App() {
  useProjects();
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <LazyMotion features={domAnimation}>
          <RouterProvider router={router} />
        </LazyMotion>
      </DndProvider>
    </Provider>
  );
}

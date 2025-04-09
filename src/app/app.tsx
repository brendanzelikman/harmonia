import { StrictMode } from "react";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LazyMotion, domAnimation } from "framer-motion";
import { router } from "app/router";
import { createRoot } from "react-dom/client";
import { store } from "app/store";
import { start } from "tone";
import { RouterProvider } from "react-router-dom";

// The root container for the application.
const container = document.getElementById("root");
if (!container) throw new Error("Root not found.");

// Initialize the audio context when the user presses their mouse.
container.addEventListener("mousedown", start, { once: true });

// Create the root and render the app.
const root = createRoot(container);
root.render(
  <StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <LazyMotion features={domAnimation}>
          <RouterProvider router={router} />
        </LazyMotion>
      </DndProvider>
    </Provider>
  </StrictMode>
);

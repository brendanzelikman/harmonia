import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { AppThunk, store } from "redux/store";
import LoadedTransport from "providers/transport";
import "./index.css";

import { start } from "tone";
import { startTransport } from "redux/Transport";
import { MIDIProvider } from "providers/midi";
import { ErrorView, LandingView } from "views";
import { HotkeysProvider } from "react-hotkeys-hook";

export const container: HTMLElement = document.getElementById("root")!;
if (!container.children.length) {
  const router = createBrowserRouter(
    [
      { path: "/", element: <LandingView />, errorElement: <ErrorView /> },
      { path: "/playground", element: <App />, errorElement: <ErrorView /> },
    ],
    { basename: "/harmonia" }
  );

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
        <ReduxProvider store={store}>
          <MIDIProvider>
            <HotkeysProvider initiallyActiveScopes={["timeline"]}>
              <RouterProvider router={router} />
            </HotkeysProvider>
          </MIDIProvider>
          <LoadedTransport />
        </ReduxProvider>
      </DndProvider>
    </React.StrictMode>
  );
}

export const startTone =
  (startingTransport = false): AppThunk =>
  async (dispatch) => {
    await start();
    if (startingTransport) dispatch(startTransport());
  };

const initializeContext = async () => {
  store.dispatch(startTone());
  container.removeEventListener("mousedown", initializeContext);
};

container.addEventListener("mousedown", initializeContext);

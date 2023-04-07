import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import App from "./App";
import { AppThunk, store } from "./redux/store";
import LoadedTransport from "providers/transport";
import "./index.css";

import { start } from "tone";
import { startTransport } from "redux/thunks/transport";

export const container: HTMLElement = document.getElementById("root")!;
if (!container.children.length) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <App />
          <LoadedTransport />
        </Provider>
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

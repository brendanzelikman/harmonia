import ReactDOM from "react-dom/client";
import { App } from "./App";
import { start } from "tone";
import { startTransport } from "redux/Transport";
import "./index.css";
import { Thunk } from "types/Project";
import { store } from "redux/store";

export const container: HTMLElement = document.getElementById("root")!;
if (!container?.children.length) {
  ReactDOM.createRoot(container).render(<App />);
}

export const startTone =
  (startingTransport = false): Thunk =>
  async (dispatch) => {
    await start();
    if (startingTransport) dispatch(startTransport());
  };

const initializeContext = async () => {
  store.dispatch(startTone());
  container.removeEventListener("mousedown", initializeContext);
};

container.addEventListener("mousedown", initializeContext);

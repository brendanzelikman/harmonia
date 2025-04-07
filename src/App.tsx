import { StrictMode } from "react";
import { Provider } from "react-redux";
import { store } from "providers/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LazyMotion, domAnimation } from "framer-motion";
import { AppRouter } from "router";

export function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <LazyMotion features={domAnimation}>
            <AppRouter />
          </LazyMotion>
        </DndProvider>
      </Provider>
    </StrictMode>
  );
}

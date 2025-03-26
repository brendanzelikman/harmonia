import { StrictMode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RouterProvider } from "react-router-dom";
import { store } from "providers/store";
import { AppRouter } from "router";
import { LazyMotion, domAnimation } from "framer-motion";

export function App() {
  return (
    <StrictMode>
      <DndProvider backend={HTML5Backend} key={1}>
        <ReduxProvider store={store}>
          <LazyMotion features={domAnimation}>
            <RouterProvider router={AppRouter} />
          </LazyMotion>
        </ReduxProvider>
      </DndProvider>
    </StrictMode>
  );
}

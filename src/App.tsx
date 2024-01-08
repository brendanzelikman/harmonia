import { StrictMode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { MIDIProvider } from "./providers/midi";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HotkeysProvider } from "react-hotkeys-hook";
import { RouterProvider } from "react-router-dom";
import { store } from "redux/store";
import { AppRouter } from "routes";
import { LazyMotion, domAnimation } from "framer-motion";
import { AuthenticationProvider } from "providers/authentication";
import { SubscriptionProvider } from "providers/subscription";

export function App() {
  return (
    <StrictMode>
      <AuthenticationProvider>
        <SubscriptionProvider>
          <HotkeysProvider initiallyActiveScopes={["timeline", "transport"]}>
            <DndProvider backend={HTML5Backend} key={1}>
              <ReduxProvider store={store}>
                <MIDIProvider>
                  <LazyMotion features={domAnimation}>
                    <RouterProvider router={AppRouter} />
                  </LazyMotion>
                </MIDIProvider>
              </ReduxProvider>
            </DndProvider>
          </HotkeysProvider>
        </SubscriptionProvider>
      </AuthenticationProvider>
    </StrictMode>
  );
}

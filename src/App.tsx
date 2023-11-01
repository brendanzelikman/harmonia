import { StrictMode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { MIDIProvider } from "providers/midi";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HotkeysProvider } from "react-hotkeys-hook";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { store } from "redux/store";
import { LandingView, ErrorView, HomeView, PlaygroundView } from "views";
import { SecureRoute } from "components/Route";

export function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <SecureRoute component={<LandingView />} />,
    },
    {
      path: "/projects",
      element: <SecureRoute private component={<HomeView view="projects" />} />,
    },
    {
      path: "/demos",
      element: <SecureRoute private component={<HomeView view="demos" />} />,
    },
    {
      path: "/profile",
      element: <SecureRoute private component={<HomeView view="profile" />} />,
    },
    {
      path: "/playground",
      element: <SecureRoute private component={<PlaygroundView />} />,
    },
    { errorElement: <ErrorView /> },
  ]);

  return (
    <StrictMode>
      <HotkeysProvider initiallyActiveScopes={["timeline", "transport"]}>
        <DndProvider backend={HTML5Backend} key={1}>
          <ReduxProvider store={store}>
            <MIDIProvider>
              <RouterProvider router={router} />
            </MIDIProvider>
          </ReduxProvider>
        </DndProvider>
      </HotkeysProvider>
    </StrictMode>
  );
}

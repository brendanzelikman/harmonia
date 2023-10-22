import { StrictMode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { MIDIProvider } from "providers/midi";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HotkeysProvider } from "react-hotkeys-hook";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { store } from "redux/store";
import { LandingView, ErrorView, HomeView, PlaygroundView } from "views";
import { PrivateRoute } from "components/PrivateRoute";

export function App() {
  const router = createHashRouter([
    { path: "/", element: <LandingView />, errorElement: <ErrorView /> },
    {
      path: "/projects",
      element: (
        <PrivateRoute>
          <HomeView view="projects" />
        </PrivateRoute>
      ),
    },
    {
      path: "/demos",
      element: (
        <PrivateRoute>
          <HomeView view="demos" />
        </PrivateRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <PrivateRoute>
          <HomeView view="profile" />
        </PrivateRoute>
      ),
    },
    {
      path: "/playground",
      element: (
        <PrivateRoute>
          <PlaygroundView />
        </PrivateRoute>
      ),
      errorElement: <ErrorView />,
    },
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

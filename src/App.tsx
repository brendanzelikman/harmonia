import { StrictMode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { MIDIProvider } from "providers/midi";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HotkeysProvider } from "react-hotkeys-hook";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { store } from "redux/store";
import { LandingView, ErrorView, HomeView, PlaygroundView } from "views";

export function App() {
  const router = createBrowserRouter(
    [
      { path: "/", element: <LandingView />, errorElement: <ErrorView /> },
      { path: "/projects", element: <HomeView view="projects" /> },
      { path: "/demos", element: <HomeView view="demos" /> },
      { path: "/profile", element: <HomeView view="profile" /> },
      {
        path: "/playground",
        element: <PlaygroundView />,
        errorElement: <ErrorView />,
      },
    ],
    { basename: "/harmonia" }
  );

  return (
    <StrictMode>
      <DndProvider backend={HTML5Backend} key={1}>
        <ReduxProvider store={store}>
          <MIDIProvider>
            <HotkeysProvider initiallyActiveScopes={["timeline"]}>
              <RouterProvider router={router} />
            </HotkeysProvider>
          </MIDIProvider>
        </ReduxProvider>
      </DndProvider>
    </StrictMode>
  );
}

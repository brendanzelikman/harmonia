import { LandingPage } from "landing";
import { MainPage } from "main";
import {
  createHashRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";

/** The hash router is either on the landing or the main page */
export const hashRouter = createHashRouter([
  {
    path: "/",
    element: <LandingPage />,
    ErrorBoundary: () => <LandingPage />,
  },
  {
    path: "/projects",
    element: <MainPage />,
    ErrorBoundary: () => <LandingPage />,
  },
  {
    path: "/demos",
    element: <MainPage />,
    ErrorBoundary: () => <LandingPage />,
  },
  {
    path: "/samples",
    element: <MainPage />,
    ErrorBoundary: () => <LandingPage />,
  },
  {
    path: "/playground",
    element: <MainPage />,
    ErrorBoundary: () => <LandingPage />,
  },
]);

/** The main router for the application. */
export const AppRouter = () => <RouterProvider router={hashRouter} />;

/** Get the name of the current route. */
export const useRoute = () => useLocation().pathname.slice(1);

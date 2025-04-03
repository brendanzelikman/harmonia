import { LandingPage } from "pages/landing";
import { MainPage } from "pages/main";
import { createHashRouter, useLocation } from "react-router-dom";

export const AppRouter = createHashRouter([
  { path: "/", element: <LandingPage />, errorElement: <LandingPage /> },
  { path: "/projects", element: <MainPage /> },
  { path: "/demos", element: <MainPage /> },
  { path: "/samples", element: <MainPage /> },
  { path: "/playground", element: <MainPage /> },
]);

export const useRouterPath = () => {
  const location = useLocation();
  return location.pathname.slice(1);
};

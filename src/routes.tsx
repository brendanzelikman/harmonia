import { SecureRoute } from "components/Route";
import { createHashRouter } from "react-router-dom";
import { LandingPage, MainPage } from "pages";

export const AppRouter = createHashRouter([
  {
    path: "/",
    element: <SecureRoute component={<LandingPage />} />,
    errorElement: <LandingPage />,
  },
  {
    path: "/projects",
    element: <SecureRoute private component={<MainPage view="projects" />} />,
  },
  {
    path: "/demos",
    element: <SecureRoute private component={<MainPage view="demos" />} />,
  },
  {
    path: "/playground",
    element: <SecureRoute private component={<MainPage view="playground" />} />,
  },
  {
    path: "/docs",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
  },
  {
    path: "/docs/types/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
  },
  {
    path: "/docs/interfaces/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
  },
  {
    path: "/docs/workflow/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
  },
  {
    path: "/docs/techniques/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
  },
]);

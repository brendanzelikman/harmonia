import { SecureRoute } from "components/Route";
import { createHashRouter } from "react-router-dom";
import { LandingPage, MainPage, ErrorPage } from "pages";

export const AppRouter = createHashRouter([
  {
    path: "/",
    element: <SecureRoute component={<LandingPage />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/projects",
    element: <SecureRoute private component={<MainPage view="projects" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/demos",
    element: <SecureRoute private component={<MainPage view="demos" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/docs",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/playground",
    element: <SecureRoute private component={<MainPage view="playground" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/docs/types/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/docs/interfaces/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/docs/workflow/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/docs/techniques/:topic",
    element: <SecureRoute private component={<MainPage view="docs" />} />,
    errorElement: <ErrorPage />,
  },
  { errorElement: <ErrorPage /> },
]);

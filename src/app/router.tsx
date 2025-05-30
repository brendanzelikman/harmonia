import { HomePage } from "features/Home/Home";
import { LandingPage } from "features/Landing/Landing";
import { isError } from "lodash";
import {
  createHashRouter,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router-dom";

export const LAND = "/";
export const MAIN = "/calculator";

/** The hash router is either on the landing or the main page */
export const router = createHashRouter([
  { path: LAND, element: <LandingPage />, ErrorBoundary: LandingPage },
  { path: MAIN, element: <HomePage />, ErrorBoundary: LandingPage },
  { path: "/demo/:id", element: <HomePage />, ErrorBoundary: LandingPage },
  { path: "/tutorial", element: <HomePage />, ErrorBoundary: LandingPage },
]);

/** Get the name of the current route. */
export const useRoute = () => useLocation().pathname;

/** Checks for an error and returns the message and stack trace. */
export const useError = () => {
  const error = useRouteError();
  const hasError = !!error;
  let errorMessage = "Unidentified Error";
  let stack = "Unidentified Call Stack";

  // Unpack the error message
  if (isError(error)) {
    errorMessage = `${error.name}: ${error.message}`;
    stack = error.stack || "";
  } else if (isRouteErrorResponse(error)) {
    errorMessage = `${error.data}`;
    stack = "This error was thrown by the router.";
  } else if (typeof error === "string") {
    errorMessage = error;
    stack = "This error was thrown by the application.";
  }

  // Create a stack trace component
  const Stack = () => (
    <div className="w-full absolute p-4 mt-4 bg-slate-800 text-slate-50">
      <pre className="text-xs">{stack}</pre>
    </div>
  );

  // Return the error message and stack trace
  return { hasError, errorMessage, Stack };
};

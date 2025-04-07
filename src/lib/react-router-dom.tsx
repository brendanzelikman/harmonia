import { isError } from "lodash";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

/** Unpacks an unknown error into a message and stack trace. */
export const unpackError = (error: unknown) => {
  let message = "Unidentified Error";
  let stack = "Unidentified Call Stack";

  if (isError(error)) {
    message = `${error.name}: ${error.message}`;
    stack = error.stack || "";
  } else if (isRouteErrorResponse(error)) {
    message = `${error.data}`;
    stack = "This error was thrown by the router.";
  } else if (typeof error === "string") {
    message = error;
    stack = "This error was thrown by the application.";
  }

  return { message, stack };
};

/** Checks for an error and returns the message and stack trace. */
export const useError = () => {
  const error = useRouteError();
  const hasError = !!error;
  const { message, stack } = unpackError(error);

  // The error stack is displayed below the main view upon scrolling down.
  const Stack = () => (
    <div className="w-full absolute p-4 bg-slate-800 text-slate-50">
      <pre className="text-xs">{stack}</pre>
    </div>
  );

  return { hasError, errorMessage: message, Stack };
};

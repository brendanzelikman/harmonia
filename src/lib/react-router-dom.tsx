import { isError } from "lodash";
import { isRouteErrorResponse } from "react-router-dom";

/**
 * Unpacks an unknown error into a message and stack trace.
 * @param error The error to unpack.
 * @returns The unpacked error.
 */
export const unpackError = (error: unknown) => {
  let message = "Error!";
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

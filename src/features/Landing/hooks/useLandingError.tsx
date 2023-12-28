import { unpackError } from "lib/react-router-dom";
import { useRouteError } from "react-router-dom";

export const useLandingError = () => {
  // Check for an error
  const error = useRouteError();
  const hasError = !!error;
  const { message, stack } = unpackError(error);

  // The error stack is displayed below the main view upon scrolling down.
  const ErrorStack = () => (
    <div className="w-full p-4 bg-slate-800 text-slate-50">
      <pre className="text-xs">{stack}</pre>
    </div>
  );

  return {
    hasError,
    errorMessage: message,
    ErrorStack,
  };
};

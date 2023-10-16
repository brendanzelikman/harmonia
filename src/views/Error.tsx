import { useRouteError } from "react-router-dom";
import { MainButton } from "./Landing";
import { Splash, Background } from "../components/Logo";
import { unpackError } from "lib/react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { clearProject } from "redux/thunks";
import { useAppDispatch } from "redux/hooks";

export function ErrorView() {
  const dispatch = useAppDispatch();
  const error = useRouteError();
  const { message, stack } = unpackError(error);

  // Clear the state when the user presses Shift + Backspace.
  const heldKeys = useHeldHotkeys(["Shift", "Backspace"]);
  useHotkeys("shift+backspace", () => dispatch(clearProject()));

  // The error message is displayed in red.
  const ErrorMessage = () => <p className="text-red-500">{message}</p>;

  // The user is advised with a note on how to clear the state.
  const ErrorAdvice = () => {
    const heldClass = "text-blue-400 font-bold";
    const shiftClass = heldKeys.shift ? heldClass : "";
    const backspaceClass = heldKeys.backspace ? heldClass : "";
    return (
      <p className="text-slate-400">
        (Note: Press{" "}
        <span className="text-blue-500">
          <span className={shiftClass}>Shift</span> +{" "}
          <span className={backspaceClass}>Backspace</span>
        </span>{" "}
        to clear the state)
      </p>
    );
  };

  // The error stack is displayed below the main view upon scrolling down.
  const ErrorStack = () => (
    <div className="w-full p-4 bg-slate-800 text-slate-50 overflow-scroll">
      <pre className="text-xs">{stack}</pre>
    </div>
  );

  return (
    <>
      <div className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
        <div className="w-full h-full text-7xl text-slate-50 font-nunito">
          <div className="absolute left-1/2 -translate-x-1/2 top-12 flex flex-col text-lg items-center font-nunito">
            <ErrorMessage />
            <ErrorAdvice />
          </div>
          <div className="w-full h-full flex flex-col justify-center items-center">
            <Background />
            <Splash />
            <MainButton />
          </div>
        </div>
      </div>
      <ErrorStack />
    </>
  );
}

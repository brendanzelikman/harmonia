import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { MainButton } from "./LandingPage";
import { Splash, Background } from "./Logo";
import { isError } from "lodash";
import useEventListeners from "hooks/useEventListeners";
import { cancelEvent, isHoldingShift, isInputEvent } from "utils";
import { clearState, loadState, saveState } from "redux/util";
import { RootState } from "redux/store";
import useKeyHolder from "hooks/useKeyHolder";

export default function ErrorPage() {
  const error = useRouteError() as string;
  let errorMessage: string;
  let errorStack: string = "";

  if (isError(error)) {
    errorMessage = `${error.name}: ${error.message}`;
    errorStack = error.stack || "";
  } else if (isRouteErrorResponse(error)) {
    errorMessage = `${error.data}`;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "Unknown Error";
  }

  useEventListeners(
    {
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          cancelEvent(e);
          clearState();
        },
      },
    },
    []
  );

  const heldKeys = useKeyHolder(["Shift", "Backspace"]);

  return (
    <>
      <div className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
        <div className="w-full h-full text-7xl text-slate-50 font-nunito">
          <div className="absolute left-1/2 -translate-x-1/2 top-12 flex flex-col text-lg items-center font-nunito">
            <p className="text-red-500">{errorMessage}</p>
            <p className="text-slate-400">
              (Note: Press{" "}
              <span className="text-blue-500">
                <span
                  className={`${
                    heldKeys.Shift ? "text-blue-400 font-bold" : ""
                  }`}
                >
                  Shift
                </span>
                {" + "}
                <span
                  className={`${
                    heldKeys.Backspace ? "text-blue-400 font-bold" : ""
                  }`}
                >
                  Backspace
                </span>
              </span>{" "}
              to clear the state)
            </p>
          </div>

          <div className="w-full h-full flex flex-col justify-center items-center">
            <Background />
            <Splash />
            <a href="/harmonia/">
              <MainButton
                href="/harmonia/playground"
                text="Visit the Playground"
              />
            </a>
          </div>
        </div>
      </div>
      {errorStack.length ? (
        <div className="w-full p-4 bg-slate-800 text-slate-50 overflow-scroll">
          <pre className="text-xs">{errorStack}</pre>
        </div>
      ) : null}
    </>
  );
}

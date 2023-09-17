import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { MainButton } from "./LandingPage";
import { Splash, Background } from "./Logo";
import { isError } from "lodash";

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

  return (
    <>
      <div className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
        <div className="w-full h-full text-7xl text-slate-50 font-nunito">
          <h1 className="absolute left-1/2 -translate-x-1/2 top-12 text-lg text-red-500 font-nunito">
            {errorMessage}
          </h1>
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

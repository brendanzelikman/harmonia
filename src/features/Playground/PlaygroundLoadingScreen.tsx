import LogoImage from "assets/images/logo.png";
import { useState } from "react";
import { getContext } from "tone";

interface PlaygroundLoadingScreenProps {
  text: string;
}

export function PlaygroundLoadingScreen(props: PlaygroundLoadingScreenProps) {
  const [clicked, setClicked] = useState(false);
  let text = props.text;
  if (!clicked && getContext().state !== "running") {
    text = "Click Anywhere To Start";
  } else {
    text = props.text;
  }
  return (
    <div
      className="size-full flex-col animate-in fade-in cursor-pointer duration-300"
      onMouseDown={() => setClicked(true)}
    >
      <div className="flex flex-col pt-16 items-center">
        <img
          src={LogoImage}
          className={`sm:w-60 sm:h-60 w-36 h-36 rounded-full shadow-xl shadow-slate-800/40`}
        />
        <h1 className="font-bold mt-6 text-slate-50 sm:text-8xl text-5xl">
          Harmonia
        </h1>
        <div className="text-slate-200 active:scale-95 bg-slate-900/50 hover:bg-slate-900/50 backdrop-blur max-sm:mt-8 mt-14 mb-auto p-4 px-8 rounded-2xl border border-indigo-500 font-light text-4xl max-sm:text-xl ease-in-out">
          {text}
        </div>
      </div>
    </div>
  );
}

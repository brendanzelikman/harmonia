import { useRoute } from "app/router";
import LogoImage from "assets/images/logo.png";
import { DEMOS_BY_KEY } from "lib/demos";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContext } from "tone";

interface LoadingScreenProps {
  text: string;
}

export function CalculatorLoadingScreen(props: LoadingScreenProps) {
  const [clicked, setClicked] = useState(false);
  const [demo, setDemo] = useState<string>();
  const { id } = useParams();
  const view = useRoute();
  useEffect(() => {
    if (!clicked) {
      if (view.startsWith("/demo") && id) {
        const demo = DEMOS_BY_KEY[id];
        if (!demo) return;
        const name = demo.project.meta.name;
        setDemo(name.toLowerCase());
        setText(`Open ${name}`);
      }
    }
  }, [id, view, clicked]);

  const [text, setText] = useState(props.text);
  useEffect(() => {
    if (!demo) {
      if (!clicked && getContext().state !== "running") {
        setText("Click Anywhere To Start");
      } else {
        setText(props.text);
      }
    }
  }, [demo, clicked]);
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

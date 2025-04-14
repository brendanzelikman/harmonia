import Background from "assets/images/background.png";
import { useEffect, useState } from "react";
import { dispatchClose } from "hooks/useToggle";
import { m } from "framer-motion";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { TutorialExposition } from "./TutorialExposition";
import { TutorialDevelopment } from "./TutorialDevelopment";
import { TutorialRecapitulation } from "./TutorialRecapitulation";
import { TutorialCoda } from "./TutorialCoda";

export default function Tutorial() {
  const hasTracks = useAppValue(selectHasTracks);

  // Keep track of the current viewed
  const [view, setView] = useState("exposition");

  // Keep track of which tabs the user has visited
  const [visited, setVisited] = useState<Record<string, boolean>>({
    exposition: true,
    development: false,
    recapitulation: false,
    coda: false,
  });
  const visit = (view: string) => {
    setView(view);
    if (!visited[view]) setVisited((prev) => ({ ...prev, [view]: true }));
  };

  // Close the live play menu when the component unmounts
  useEffect(() => {
    return () => {
      setTimeout(() => dispatchClose("livePlay"), 50);
    };
  }, []);

  if (hasTracks) return null;
  return (
    <div className="size-full flex flex-col lg:items-center max-lg:px-10 gap-10 pt-12 relative bg-slate-900/50 transition-all">
      <img
        className="absolute size-full inset-0 opacity-50 -z-10 animate-background"
        src={Background}
        alt="Background"
      />
      <m.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          type: "spring",
          bounce: 1,
          stiffness: 120,
          mass: 1,
        }}
        className="bg-radial from-slate-900/80 to-slate-950/70 backdrop-blur-lg select-none text-center px-10 py-5 max-lg:py-4 border-2 border-sky-600 rounded-2xl"
      >
        <div className="mb-4 max-lg:mb-1 text-4xl max-lg:text-2xl text-slate-100 font-bold drop-shadow-sm">
          Welcome to the Playground!
        </div>
        <div className="text-2xl flex gap-2 justify-center max-lg:text-lg font-normal text-slate-300">
          <div
            data-active={view === "exposition"}
            data-visited={visited.exposition}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("exposition")}
          >
            Exposition
          </div>
          {" • "}
          <div
            data-active={view === "development"}
            data-visited={visited.development}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("development")}
          >
            Development
          </div>
          {" • "}
          <div
            data-active={view === "recapitulation"}
            data-visited={visited.recapitulation}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("recapitulation")}
          >
            Recapitulation
          </div>
          {" • "}
          <div
            data-active={view === "coda"}
            data-visited={visited.coda}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("coda")}
          >
            Coda
          </div>
        </div>
      </m.div>
      <TutorialExposition view={view} />
      {view === "development" && <TutorialDevelopment />}
      {view === "recapitulation" && <TutorialRecapitulation />}
      {view === "coda" && <TutorialCoda />}
    </div>
  );
}

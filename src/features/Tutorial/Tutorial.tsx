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
import { TutorialIntroduction } from "./TutorialIntroduction";
import { GiHighFive } from "react-icons/gi";

export default function Tutorial() {
  const hasTracks = useAppValue(selectHasTracks);

  // Keep track of the current viewed
  const [view, setView] = useState("introduction");
  const [tutorial, setTutorial] = useState(true);

  // Keep track of which tabs the user has visited
  const [visited, setVisited] = useState<Record<string, boolean>>({
    introduction: true,
    exposition: false,
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
    <div className="size-full flex flex-col overflow-scroll items-center gap-8 lg:gap-16 max-lg:px-10 lg:pt-12 pt-8 pb-4 relative bg-slate-900/50 transition-all">
      <m.div
        initial="hidden"
        whileInView="visible"
        variants={variants}
        transition={{
          duration: 0.5,
          staggerChildren: 0.25,
          type: "spring",
          stiffness: 80,
          mass: 0.4,
        }}
        className="bg-radial relative to-slate-950/70 from-indigo-900/20 via-slate-950/20 border-sky-700 max-lg:w-md w-5xl backdrop-blur-lg select-none text-center py-6 max-lg:py-4 border-2 rounded-2xl"
      >
        <m.div
          initial="hidden"
          whileInView="visible"
          className="max-lg:mb-1 total-center gap-4 animate-in fade-in text-5xl px-4 max-lg:text-3xl text-slate-100 font-bold drop-shadow-sm"
        >
          {"New Project Tutorial"}
        </m.div>
        <m.div
          data-tutorial={tutorial}
          initial="hidden"
          whileInView="visible"
          variants={variants}
          transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
          className="text-2xl mt-4 hidden data-[tutorial=true]:flex gap-x-3 justify-center max-lg:text-lg flex-wrap font-normal text-slate-300"
        >
          <m.div
            data-active={view === "introduction"}
            data-visited={visited.introduction}
            variants={variants}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("introduction")}
          >
            Introduction
          </m.div>
          <m.div variants={variants}>{" • "}</m.div>
          <m.div
            data-active={view === "exposition"}
            data-visited={visited.exposition}
            variants={variants}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("exposition")}
          >
            Exposition
          </m.div>
          <m.div variants={variants}>{" • "}</m.div>
          <m.div
            data-active={view === "development"}
            data-visited={visited.development}
            variants={variants}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("development")}
          >
            Development
          </m.div>
          <m.div variants={variants}>{" • "}</m.div>
          <m.div
            data-active={view === "recapitulation"}
            data-visited={visited.recapitulation}
            variants={variants}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("recapitulation")}
          >
            Recapitulation
          </m.div>
          <m.div variants={variants}>{" • "}</m.div>
          <m.div
            data-active={view === "coda"}
            data-visited={visited.coda}
            variants={variants}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("coda")}
          >
            Coda
          </m.div>
        </m.div>
      </m.div>
      <TutorialIntroduction
        view={view}
        setView={setView}
        tutorial={tutorial}
        startTutorial={() =>
          tutorial ? visit("exposition") : setTutorial(true)
        }
      />
      <TutorialExposition view={view} />
      <TutorialDevelopment view={view} />
      <TutorialRecapitulation view={view} />
      <TutorialCoda view={view} />
    </div>
  );
}

const variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1 },
};

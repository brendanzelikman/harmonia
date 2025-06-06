import { useEffect, useState } from "react";
import { dispatchClose } from "hooks/useToggle";
import { m } from "framer-motion";
import { TutorialExposition } from "./TutorialExposition";
import { TutorialDevelopment } from "./TutorialDevelopment";
import { TutorialRecapitulation } from "./TutorialRecapitulation";
import { TutorialCoda } from "./TutorialCoda";
import { TutorialIntroduction } from "./TutorialIntroduction";
import Background from "/background.png";

export default function Tutorial() {
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

  return (
    <div className="size-full flex flex-col overflow-scroll items-center gap-8 max-lg:px-10 pt-8 pb-4 fixed z-[200] inset-0 top-35 bg-slate-950/60">
      <img
        src={Background}
        className="absolute inset-0 size-full object-cover rounded-2xl opacity-10 -z-10"
        alt="Background"
      />
      <m.div
        initial="hidden"
        whileInView="visible"
        variants={variants}
        transition={{
          duration: 0.5,
          delay: 0.3,
          delayChildren: 0.5,
          staggerChildren: 0.2,
          type: "spring",
          stiffness: 80,
          mass: 0.4,
        }}
        className="bg-radial relative bg-slate-950/50 border-sky-700 max-xl:w-auto lg:w-5xl px-12 backdrop-blur-lg select-none text-center py-6 max-lg:py-4 border-2 rounded-2xl"
      >
        <m.div
          initial="hidden"
          whileInView="visible"
          className="max-lg:mb-1 total-center animate-in fade-in text-4xl px-4 max-lg:text-3xl text-slate-100 font-bold drop-shadow-sm"
        >
          {"Welcome to Musical Space"}
        </m.div>
        <m.div
          data-tutorial={tutorial}
          initial="hidden"
          whileInView="visible"
          variants={variants}
          transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
          className="text-xl mt-4 hidden data-[tutorial=true]:flex gap-x-3 justify-center max-lg:text-lg flex-wrap font-normal text-slate-300"
        >
          <div
            data-active={view === "introduction"}
            data-visited={visited.introduction}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("introduction")}
          >
            Introduction
          </div>
          <div>{" • "}</div>
          <div
            data-active={view === "exposition"}
            data-visited={visited.exposition}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("exposition")}
          >
            Exposition
          </div>
          <div>{" • "}</div>
          <div
            data-active={view === "development"}
            data-visited={visited.development}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("development")}
          >
            Development
          </div>
          <div>{" • "}</div>
          <div
            data-active={view === "recapitulation"}
            data-visited={visited.recapitulation}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("recapitulation")}
          >
            Recapitulation
          </div>
          <div>{" • "}</div>
          <div
            data-active={view === "coda"}
            data-visited={visited.coda}
            className="data-[active=true]:text-slate-100 data-[active=false]:data-[visited=true]:text-sky-500 data-[active=false]:data-[visited=false]:text-slate-500 scale-100 hover:scale-[1.02] ease-out duration-300 cursor-pointer"
            onClick={() => visit("coda")}
          >
            Coda
          </div>
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
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
};

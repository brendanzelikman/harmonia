import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import { DEMOS_BY_KEY } from "lib/demos";
import {
  GiKiwiBird,
  GiMoon,
  GiMoonOrbit,
  GiPianoKeys,
  GiVolcano,
  GiWaterfall,
} from "react-icons/gi";
import { loadDemoProject } from "types/Project/ProjectLoaders";
import { useNavigate } from "react-router-dom";
import { MAIN } from "app/router";

const variants = {
  hidden: { opacity: 0, translateY: 20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingDemos = () => {
  const navigate = useNavigate();
  return (
    <LandingSection className="min-h-screen py-20">
      <div className="total-center-col gap-18 max-sm:gap-8">
        <div className="flex flex-col items-center backdrop-blur gap-3 text-5xl max-sm:text-4xl font-bold">
          <div>Demo Showcase</div>
          <div className="text-base font-light text-slate-300">
            (Click on the top left icon to see all demos)
          </div>
        </div>
        <div className="total-center gap-12 max-sm:gap-4 flex-wrap *:w-1/4 max-sm:*:w-full max-sm:*:mx-16">
          {LANDING_DEMO_PROJECTS.map((demo, index) => (
            <m.div
              key={index}
              className="total-center-col border border-sky-500 cursor-pointer group p-4 bg-slate-900/70 backdrop-blur rounded-lg"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                type: "spring",
              }}
              variants={variants}
              onClick={() =>
                loadDemoProject(demo.project, () => navigate(MAIN))
              }
            >
              <div className="text-8xl max-sm:text-5xl text-slate-400 group-hover:saturate-150 group-hover:scale-105 mb-4 max-sm:mb-2">
                {demo.icon}
              </div>
              <div className="text-xl max-sm:text-lg font-semibold mb-1 max-sm:mb-0">
                {demo.project.meta.name}
              </div>
              <div className="text-lg max-sm:text-base font-thin text-slate-400">
                {demo.blurb}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
};

const LANDING_DEMO_PROJECTS = [
  {
    ...DEMOS_BY_KEY["prelude in c major"],
    icon: <GiPianoKeys className="text-amber-200/80" />,
  },
  {
    ...DEMOS_BY_KEY["etude in c major"],
    icon: <GiWaterfall className="text-sky-400/80" />,
  },
  {
    ...DEMOS_BY_KEY["moonlight sonata, mvt 3"],
    icon: <GiMoon className="text-indigo-400/80" />,
  },
  {
    ...DEMOS_BY_KEY["bird changes"],
    icon: <GiKiwiBird className="text-orange-300/80" />,
  },
  {
    ...DEMOS_BY_KEY["fly me to barry"],
    icon: <GiMoonOrbit className="text-blue-300/80" />,
  },
  {
    ...DEMOS_BY_KEY["lavos"],
    icon: <GiVolcano className="text-red-500/80" />,
  },
];

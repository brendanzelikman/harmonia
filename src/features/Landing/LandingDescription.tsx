import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import {
  GiMusicalScore,
  GiCalculator,
  GiMusicalKeyboard,
} from "react-icons/gi";
import { useState } from "react";
import { mod } from "utils/math";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import Composition from "/media/composition.gif";
import Calculation from "/media/calculation.mov";
import Improvisation from "/media/improvisation.mov";
import Performance from "/media/performance.mov";

export const LandingDescription = () => {
  const [view, setView] = useState<View>("Composition");
  const nextView = () =>
    setView((prev) => views[mod(views.indexOf(prev) + 1, 4)]);
  const prevView = () =>
    setView((prev) => views[mod(views.indexOf(prev) - 1, 4)]);
  return (
    <LandingSection className="h-screen pt-12">
      <m.div
        className="gap-8 mb-8 w-full p-4 px-12 text-3xl font-bold rounded"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        viewport={{ once: true }}
      >
        <div className="min-[1300px]:hidden flex items-center w-full gap-4">
          <BsArrowLeftCircle
            className="cursor-pointer text-slate-400 size-8 bg-slate-900 rounded-full mr-auto"
            onClick={prevView}
          />
          <div className="text-3xl font-bold">{view}</div>
          <BsArrowRightCircle
            className="cursor-pointer text-slate-400 size-8 bg-slate-900 rounded-full ml-auto"
            onClick={nextView}
          />
        </div>
        <div className="max-[1300px]:hidden w-full gap-4 flex justify-center items-center">
          <div
            data-view={view}
            className="data-[view=Composition]:border-sky-400 border border-slate-300/0 cursor-pointer rounded-xl p-1 px-2 w-56 transition-all duration-300 text-center"
            onClick={() => setView("Composition")}
          >
            Composition
          </div>
          <div className="w-[1px] h-12 min-h-0 bg-slate-400/80 rounded" />
          <div
            data-view={view}
            className="data-[view=Improvisation]:border-amber-400 border border-slate-300/0 cursor-pointer rounded-xl p-1 px-2 w-56 transition-all duration-300 text-center"
            onClick={() => setView("Improvisation")}
          >
            Improvisation
          </div>
          <div className="w-[1px] h-12 min-h-0 bg-slate-400/80 rounded" />
          <div
            data-view={view}
            className="data-[view=Calculation]:border-emerald-400 border border-slate-300/0 cursor-pointer rounded-xl p-1 px-2 w-56 transition-all duration-300 text-center"
            onClick={() => setView("Calculation")}
          >
            Calculation
          </div>
          <div className="w-[1px] h-12 min-h-0 bg-slate-400/80 rounded" />
          <div
            data-view={view}
            className="data-[view=Performance]:border-fuchsia-400 border border-slate-300/0 cursor-pointer rounded-xl p-1 px-2 w-56 transition-all duration-300 text-center"
            onClick={() => setView("Performance")}
          >
            Performance
          </div>
        </div>
      </m.div>
      <m.div
        className="w-full flex flex-wrap justify-center gap-16 *:animate-in *:fade-in"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        transition={{ delayChildren: 0.2, staggerChildren: 0.25 }}
      >
        {view === "Composition" && (
          <div className="flex flex-col rounded-xl overflow-hidden">
            <img
              src={Composition}
              className="shadow-2xl h-96 object-fit p-4 w-4xl bg-slate-950/90"
            />
            <div className="flex flex-col gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
              <div>Create Music with Complex Shapes</div>
              <div className="text-lg text-slate-400">
                Develop Patterns with Precision and Power
              </div>
            </div>
          </div>
        )}
        {view === "Improvisation" && (
          <div className="flex flex-col rounded-xl overflow-hidden">
            <video
              src={Improvisation}
              loop
              autoPlay
              className="shadow-2xl w-4xl h-96 object-fit bg-slate-950/90 p-4"
            />
            <div className="flex flex-col gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
              <div>Make Changes with Keyboard Gestures</div>
              <div className="text-lg text-slate-400">
                Find Voice Leadings with Intuitive Shortcuts
              </div>
            </div>
          </div>
        )}
        {view === "Calculation" && (
          <div className="flex flex-col rounded-xl overflow-hidden">
            <video
              src={Calculation}
              loop
              autoPlay
              className="shadow-2xl w-4xl h-96 object-fit bg-slate-950/90 p-4"
            />
            <div className="flex flex-col gap-2 p-4 pt-2 my-auto text-2xl text-slate-300 bg-slate-950/80 font-light">
              <div>Navigate Scales with Full Control</div>
              <div className="text-lg text-slate-400">
                Write Sequences with Transparent Logic
              </div>
            </div>
          </div>
        )}
        {view === "Performance" && (
          <div className="flex flex-col rounded-xl overflow-hidden">
            <video
              src={Performance}
              loop
              autoPlay
              className="shadow-2xl w-4xl h-96 object-fit bg-slate-950/90 p-4"
            />
            <div className="flex flex-col gap-2 p-4 pt-2 my-auto text-2xl text-slate-300 bg-slate-950/80 font-light">
              <div>Design Instruments with Web Audio</div>
              <div className="text-lg text-slate-400">
                Build Samplers with Custom Sounds and Effects
              </div>
            </div>
          </div>
        )}
      </m.div>
    </LandingSection>
  );
};

const views = [
  "Composition",
  "Improvisation",
  "Calculation",
  "Performance",
] as const;
type View = (typeof views)[number];

const descriptions = {
  "Digital Audio Workstation": {
    items: [
      "Local-First Sandbox Environment",
      "Read and Write Projects in JSON",
      "Export Data To MIDI and WAV",
      "Learn with Demos and Tutorials",
      "No Installation Or Setup Required",
    ],
    icon: <GiMusicalScore />,
  },
  "Voice Leading Calculator": {
    items: [
      "Theory-First Software Design",
      "Scales with Hierarchical Structures",
      "Patterns with Harmonic Functions",
      "Poses with Multidimensional Logic",
      "Programmable JavaScript Effects",
    ],
    icon: <GiCalculator />,
  },
  "Virtual Musical Instrument": {
    items: [
      "Browser-Based Audio Engine",
      "Custom Instruments and Effects",
      "Interactive Keyboard Gestures",
      "Record to MIDI and WAV",
      "Upload Your Own Samples",
    ],
    icon: <GiMusicalKeyboard />,
  },
};

const categories = Object.keys(descriptions) as Array<
  keyof typeof descriptions
>;

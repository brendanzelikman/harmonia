import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import {
  GiMusicalScore,
  GiCalculator,
  GiMusicalKeyboard,
} from "react-icons/gi";
import Composition from "/media/composition.gif";
import Improvisation from "/media/improvisation.mov";
import Progression from "/media/progression.mov";
import ProgressionGif from "/media/progression.gif";
import Performance from "/media/performance.mov";
import Screenshot from "/media/screenshot.png";

export const LandingDescription = () => {
  return (
    <LandingSection className="min-h-screen">
      <div className="animate-in fade-in duration-300 gap-8 mb-8 w-full px-12 text-3xl font-bold rounded">
        <div className="max-[1300px]:hidden w-full gap-4 flex justify-center items-center">
          <div className="rounded-xl p-1 px-2 transition-all animate-in fade-in duration-300">
            Find Voice Leadings with Precision and Ease.
          </div>
        </div>
      </div>
      <m.div
        className="w-full flex flex-wrap justify-center gap-16 *:animate-in *:fade-in"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        transition={{ delayChildren: 0.2, staggerChildren: 0.25 }}
      >
        <div className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90">
          <img
            src={Screenshot}
            className="shadow-2xl h-64 w-xl object-cover object-top-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/64 p-4 pt-2 font-light">
            <div>Design "Trees" of Chords and Scales</div>
            <div className="text-lg text-slate-400">
              Model the Geometry of Any Kind of Music
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90">
          <img
            src={Composition}
            className="shadow-2xl h-64 w-xl object-cover object-bottom-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Develop Notes with Musical "Poses"</div>
            <div className="text-lg text-slate-400">
              Transform Patterns with Mathematical Operations
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90">
          <video
            src={Improvisation}
            loop
            autoPlay
            className="shadow-2xl h-64 w-xl object-cover object-bottom-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Move Quickly with Keyboard Gestures</div>
            <div className="text-lg text-slate-400">
              Generate, Edit, and Mix with Intuitive Shortcuts
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90">
          <video
            src={Performance}
            loop
            autoPlay
            className="shadow-2xl h-64 w-xl object-cover object-top-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full gap-2 p-4 pt-2 my-auto text-2xl text-slate-300 bg-slate-950/80 font-light">
            <div>Play Music in the Browser</div>
            <div className="text-lg text-slate-400">
              Design Custom Instruments with Audio Effects
            </div>
          </div>
        </div>
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

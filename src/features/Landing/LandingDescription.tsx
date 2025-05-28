import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import Composition from "/media/composition.gif";
import Improvisation from "/media/improvisation.mov";
import Performance from "/media/performance.mov";
import Screenshot from "/media/screenshot.png";

const variants = {
  hidden: { opacity: 0, translateY: -20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingDescription = () => {
  return (
    <LandingSection className="min-h-screen mb-8">
      <m.div
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        viewport={{ once: true }}
        className="gap-8 mb-8 w-full px-12 text-3xl font-bold rounded"
      >
        <div className="max-[1300px]:hidden w-full gap-4 flex justify-center items-center">
          <div className="rounded-xl p-1 px-2 transition-all animate-in fade-in duration-300">
            Find Voice Leadings with Precision and Ease.
          </div>
        </div>
      </m.div>
      <m.div
        className="w-full flex flex-wrap justify-center gap-16 *:animate-in *:fade-in"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{
          delay: 0.5,
          delayChildren: 0.5,
          staggerChildren: 0.1,
        }}
      >
        <m.div
          variants={variants}
          transition={{ type: "spring" }}
          className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90"
        >
          <img
            src={Screenshot}
            className="shadow-2xl h-64 w-xl object-cover object-top-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Design Musical Architectures</div>
            <div className="text-lg text-slate-400">
              Model the Geometry of Chords and Scales
            </div>
          </div>
        </m.div>
        <m.div
          variants={variants}
          transition={{ type: "spring" }}
          viewport={{ once: true }}
          className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90"
        >
          <img
            src={Composition}
            className="shadow-2xl h-64 w-xl object-cover object-bottom-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Apply Mathematical Transformations</div>
            <div className="text-lg text-slate-400">
              Develop Patterns Within Multiple Dimensions
            </div>
          </div>
        </m.div>
        <m.div
          variants={variants}
          transition={{ type: "spring" }}
          viewport={{ once: true }}
          className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90"
        >
          <video
            src={Improvisation}
            loop
            autoPlay
            className="shadow-2xl h-64 w-xl object-cover object-bottom-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full gap-2 my-auto text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Integrate Keyboard Gestures</div>
            <div className="text-lg text-slate-400">
              Compose and Perform with Intuitive Shortcuts
            </div>
          </div>
        </m.div>
        <m.div
          variants={variants}
          transition={{ type: "spring" }}
          viewport={{ once: true }}
          className="flex flex-col rounded-xl overflow-hidden border-2 border-blue-600/90"
        >
          <video
            src={Performance}
            loop
            autoPlay
            className="shadow-2xl h-64 w-xl object-cover object-top-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full gap-2 p-4 pt-2 my-auto text-2xl text-slate-300 bg-slate-950/80 font-light">
            <div>Play Music in the Browser</div>
            <div className="text-lg text-slate-400">
              Build Instruments with Audio Effects
            </div>
          </div>
        </m.div>
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

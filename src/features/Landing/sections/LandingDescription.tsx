import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";
import Composition from "/media/composition.gif";
import Portals from "/media/portals.png";
import Performance from "/media/performance.gif";
import Hotkeys from "/media/hotkeys.jpg";
import Terminal from "/media/terminal.png";
import Math from "/media/math.png";
import Easy from "/media/easy.png";
import Nest from "/media/nest.png";
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
        className="max-[1300px]:hidden gap-8 w-full px-12 text-3xl font-bold rounded"
      >
        <div className="mb-8 w-full gap-4 flex justify-center items-center">
          <div className="rounded-xl p-1 px-2 transition-all animate-in fade-in duration-300">
            Find Voice Leadings with Precision and Ease.
          </div>
        </div>
      </m.div>
      <m.div
        className="w-full flex flex-wrap justify-center px-2 gap-16 max-sm:gap-8 *:animate-in *:fade-in"
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
            className="shadow-2xl max-sm:h-48 h-64 w-xl object-cover object-top-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Design Musical Architectures</div>
            <div className="max-sm:text-base text-lg text-slate-400">
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
            className="shadow-2xl max-sm:h-48 h-64 w-xl object-cover object-bottom-left p-4 bg-slate-950/90"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Apply Mathematical Transformations</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Develop Notes Across Multiple Dimensions
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
            src={Hotkeys}
            className="shadow-2xl max-sm:h-48 h-64 w-xl object-cover object-bottom-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Perform Keyboard Gestures</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Compose Quickly with Accessible Shortcuts
            </div>
          </div>
        </m.div>
        <m.div
          variants={variants}
          transition={{ type: "spring" }}
          viewport={{ once: true }}
          className="flex flex-col w-xl rounded-xl overflow-hidden border-2 border-blue-600/90"
        >
          <div className="h-64 w-full bg-slate-950/80">
            <img
              src={Performance}
              className="shadow-2xl max-sm:h-48 h-64 w-xl object-cover object-top-left p-4 bg-slate-950/90"
            />
          </div>
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 p-4 pt-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 font-light">
            <div>Play Cool Sounds</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Build Instruments with Custom Effects
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
            src={Nest}
            className="shadow-2xl max-sm:h-48 h-64 w-xl object-cover object-bottom-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Create Elaborate Structures</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Unravel the Layers of Musical Space
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
            src={Easy}
            className="shadow-2xl max-sm:h-48 h-64 w-xl object-top-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full *:first:mt-auto gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Calculate Difficult Sequences</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Explore Ideas Without Losing Time
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
            src={Math}
            className="shadow-2xl max-sm:h-48 h-68 w-xl object-cover object-top-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Design Custom Functions</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Write Mathematical Formulas with JavaScript
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
            src={Portals}
            className="shadow-2xl max-sm:h-48 h-68 w-xl object-cover object-top-left bg-slate-950/90 p-4"
          />
          <div className="flex flex-col h-full *:first:mt-auto justify-evenly gap-2 my-auto max-sm:text-xl text-2xl text-slate-300 bg-slate-950/80 p-4 pt-2 font-light">
            <div>Discover Easter Eggs</div>
            <div className="max-sm:text-base text-lg text-slate-400">
              Have Fun With Whimsical Features
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

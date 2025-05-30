import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import Thesis from "/media/thesis.mp4";
import Demo from "/media/demo.mp4";
import Lavos from "/media/lavos.png";
import { Link } from "react-router-dom";

const variants = {
  hidden: { opacity: 0, translateY: 20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingVideo = () => {
  return (
    <LandingSection className="pb-20 -mt-10">
      <div className="total-center-col gap-12">
        <div className="flex flex-col items-center gap-4 text-5xl max-sm:text-4xl font-bold">
          <div>Hall of Fame</div>
          <div className="text-base font-semibold text-gray-200 bg-slate-800 px-2 rounded">
            Memorable footage of Harmonia over the years
          </div>
        </div>
        <m.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
          className="sm:p-6 flex justify-center flex-wrap max-sm:gap-6 gap-20 *:bg-slate-950 *:p-4 *:pt-2 *:px-4 *:rounded-lg *:flex *:flex-col *:items-center *:justify-between max-sm:*:text-lg *:text-3xl *:gap-4 *:font-light"
        >
          <m.div variants={variants} viewport={{ once: true }}>
            <video
              className="max-sm:w-xs"
              width="550"
              height="300"
              src={Thesis}
              controls
            />
            <div>Scriabinism (Demo, 2023)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <iframe
              className="max-sm:w-xs"
              width="550"
              height="340"
              src="https://www.youtube.com/embed/FCnJfxeMb98"
            />
            <div>Introducing... (Trailer, 2024)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <video
              className="max-sm:w-xs"
              width="550"
              height="450"
              src={Demo}
              controls
            />
            <div>Pastabassed (Improv, 2024)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <Link to="/demos/lavos">
              <img
                className="max-sm:w-xs"
                width="550"
                height="450"
                src={Lavos}
              />
            </Link>
            <div>Lavos (Techno, 2025)</div>
          </m.div>
        </m.div>
      </div>
    </LandingSection>
  );
};

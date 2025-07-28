import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";
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
    <main className="size-full overflow-scroll">
      <LandingSection className="pt-nav pb-20">
        <div className="total-center-col pt-8 gap-12">
          <m.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
            className="sm:p-6 flex justify-center flex-wrap max-sm:gap-6 gap-20 *:bg-slate-950 *:border-2 *:border-indigo-500 *:p-4 *:pt-2 *:px-4 *:rounded-lg *:flex *:flex-col *:items-center *:justify-between max-sm:*:text-lg *:text-3xl *:gap-4 *:font-light"
          >
            <m.div variants={variants} viewport={{ once: true }}>
              <video
                className="max-sm:w-xs"
                width="550"
                height="150"
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
              <Link to="/demo/lavos">
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
    </main>
  );
};

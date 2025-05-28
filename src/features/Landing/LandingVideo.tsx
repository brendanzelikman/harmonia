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
    <LandingSection className="min-h-screen py-20">
      <div className="total-center-col gap-8">
        <div className="text-5xl font-bold">Hall of Fame</div>
        <m.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
          className="p-16 flex justify-center flex-wrap gap-12 *:bg-slate-950 *:p-4 *:pt-2 *:px-4 *:rounded-lg *:flex *:flex-col *:items-center *:justify-between *:text-3xl *:gap-4 *:font-light"
        >
          <m.div variants={variants} viewport={{ once: true }}>
            <video width="600" height="450" src={Thesis} controls />
            <div>Scriabinism (Demo, 2023)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <iframe
              width="600"
              height="410"
              src="https://www.youtube.com/embed/FCnJfxeMb98"
            />
            <div>Introducing... (Trailer, 2024)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <video width="600" height="450" src={Demo} controls />
            <div>Pasta (Improv, 2024)</div>
          </m.div>
          <m.div variants={variants} viewport={{ once: true }}>
            <Link to="/demos/lavos">
              <img width="600" height="450" src={Lavos} />
            </Link>
            <div>Lavos (Techno, 2025)</div>
          </m.div>
        </m.div>
      </div>
    </LandingSection>
  );
};

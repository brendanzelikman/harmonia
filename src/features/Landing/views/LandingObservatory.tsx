import { m } from "framer-motion";
import { LandingSection, LandingHeroProps } from "../components";

export const LandingObservatory = (props: LandingHeroProps) => (
  <LandingSection className="mt-4 p-8">
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mt-auto text-blue-200/50 text-center select-none"
    >
      Music is enough for a lifetime, but a lifetime is not enough for music.
      <br />
      Background Credit:{" "}
      <a
        href="https://coolbackgrounds.io/"
        className="hover:text-blue-400 transition-colors duration-200"
        target="_blank"
      >
        <i>coolbackgrounds.io</i>
      </a>
    </m.div>
  </LandingSection>
);

import { m } from "framer-motion";
import { LandingSection } from "../components";

export const LandingObservatory = () => (
  <LandingSection className="mt-4 p-8">
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mt-auto text-blue-200/50 text-center select-none"
    >
      It's nice to take a breath of fresh air sometimes.
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

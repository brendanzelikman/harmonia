import { m } from "framer-motion";
import { LandingSection } from "./Section";

export const LandingFooter = () => (
  <LandingSection className="mt-4 p-8">
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mt-auto text-blue-200/50 text-center select-none"
    >
      Have fun!
    </m.div>
  </LandingSection>
);

import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";

export const LandingFooter = () => (
  <LandingSection className="mt-4 p-8 h-full">
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="flex flex-col justify-end h-full text-blue-200/50 text-center select-none"
    >
      "Music is enough for a lifetime, but a lifetime is not enough for music."
    </m.div>
  </LandingSection>
);

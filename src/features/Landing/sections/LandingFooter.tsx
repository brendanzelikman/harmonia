import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";

export const LandingFooter = () => (
  <LandingSection className="mt-4 p-8 flex flex-col justify-end">
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="text-gray-300 text-center select-none w-fit whitespace-nowrap mx-auto px-2 rounded"
    >
      "Music is enough for a lifetime, but a lifetime is not enough for music."
    </m.div>
  </LandingSection>
);

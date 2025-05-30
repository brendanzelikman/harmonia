import { PopupHeader } from "features/Landing/components/LandingHeader";
import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import { MagicalPiano } from "features/Home/HomePiano";

export const LandingPiano = () => {
  return (
    <LandingSection className="gap-16 min-h-screen flex flex-col justify-center">
      <PopupHeader title="Quick! We Need A Solo!" />
      <m.div
        className="flex flex-wrap gap-y-12 p-12"
        initial={{ opacity: 0, translateY: 20, scale: 0.8 }}
        whileInView={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        viewport={{ once: true }}
      >
        <MagicalPiano />
      </m.div>
    </LandingSection>
  );
};

import { PopupHeader } from "features/Landing/components/LandingHeader";
import { m } from "framer-motion";
import { LandingSection } from "../components/LandingSection";
import { MagicalPiano } from "components/MagicalPiano";

export const LandingPiano = () => {
  return (
    <LandingSection className="flex flex-col gap-15 py-15">
      <PopupHeader title="Make Music Now!" />
      <m.div
        className="flex flex-wrap p-12"
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

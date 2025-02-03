import { m } from "framer-motion";
import {
  LandingSection,
  LandingPriceBox,
  LandingPopupHeader,
  LandingHeroProps,
} from "../components";
import {
  MAESTRO_PRICE,
  MAESTRO_PROJECT_LIMIT,
  PRODIGY_PRICE,
  VIRTUOSO_PRICE,
} from "utils/rank";

export const LandingPricingHero = (props: LandingHeroProps) => {
  return (
    <LandingSection className="py-10 px-5 justify-center text-white">
      <LandingPopupHeader title="What is Harmonia?" />
      <div className="w-full flex flex-wrap justify-center gap-16">
        <m.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LandingPriceBox
            name="Workstation"
            isEnabled
            price={`$${PRODIGY_PRICE} / month`}
            description="Web-Based Musical Sandbox"
            features={[
              "Create and Edit Projects",
              "Autosaves to the Browser",
              "Harmonia Markup (HAM) Files",
              "Full Documentation Online",
              "Desktop Application Available",
            ]}
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LandingPriceBox
            name="Instrument"
            isEnabled
            price={`$${MAESTRO_PRICE} / month`}
            description="Live Musical Playground"
            features={[
              "Real-Time Audio Playback",
              "Diverse Library of Instruments",
              "Customizable Sound Effects",
              "Plug-and-Play MIDI Devices",
              "Export to MIDI and WAV",
            ]}
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LandingPriceBox
            name="Companion"
            isEnabled
            price={`$${VIRTUOSO_PRICE} / month`}
            description="Integrated VST Plugin"
            features={[
              "Desktop-Only Feature",
              "Connects to another DAW",
              "Synchronize Each Track",
              "Schedule MIDI Notes",
              "Play Both Simultaneously",
            ]}
          />
        </m.div>
      </div>
    </LandingSection>
  );
};

import { m } from "framer-motion";
import {
  LandingSection,
  LandingPriceBox,
  LandingPopupHeader,
  LandingHeroProps,
} from "../components";
import { useAuth } from "providers/auth";
import { MAESTRO_PROJECT_LIMIT } from "utils/constants";

export const LandingPricingHero = (props: LandingHeroProps) => {
  const { isProdigy, isMaestro, isVirtuoso } = useAuth();

  return (
    <LandingSection className="py-10 px-5 justify-center text-white">
      <LandingPopupHeader title="It's dangerous to go alone! Take this." />
      <div className="w-full flex flex-wrap justify-center gap-16">
        <m.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LandingPriceBox
            name="prodigy"
            isEnabled={isProdigy}
            price={"$0 / month"}
            description="Get started with the basics."
            features={[
              "Access to Website",
              "Read/Write a Project",
              "Basic Demos and Presets",
              "Export to HAM + WAV",
              "Documentation + Tutorial",
              "Developer Support",
              "No Strings Attached!",
            ]}
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LandingPriceBox
            name="maestro"
            isEnabled={isMaestro}
            price={"$10 / month"}
            description="Unleash the Playground."
            features={[
              "Live Mixing and Posing",
              `Store Up to ${MAESTRO_PROJECT_LIMIT} Projects`,
              "Extensive Demos and Presets",
              "Export to MIDI + MusicXML",
              "Plug and Play with MIDI",
              "Developer Gratitude",
              "Email Support",
            ]}
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LandingPriceBox
            name="virtuoso"
            isEnabled={isVirtuoso}
            price={"$20 / month"}
            description="Go even further beyond."
            features={[
              "Desktop Application",
              "Sync With VST Plugin",
              "Every Feature Unlocked",
              "Store Unlimited Projects",
              "Access to Beta Features",
              "Developer Love",
              "Priority Support",
            ]}
          />
        </m.div>
      </div>
    </LandingSection>
  );
};

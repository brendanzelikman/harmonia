import { m } from "framer-motion";
import {
  LandingSection,
  LandingPriceBox,
  LandingPopupHeader,
} from "./components";
import { useAuthenticationStatus } from "hooks";

export const LandingPricingHero = () => {
  const auth = useAuthenticationStatus();
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
            isEnabled={auth.isFree}
            price={"$0 / month"}
            description="Work any time on the web."
            features={[
              "Access to Website",
              "Export to HAM + WAV",
              "Access to Limited Presets",
              "Read/Write Local Projects",
              "All Core Functionality",
              "Full Documentation",
              "Community Support",
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
            isEnabled={auth.isPro}
            price={"$10 / month"}
            description="Unleash the Playground."
            features={[
              "Live Mixing and Posing",
              "Export to MIDI + MusicXML",
              "Access to Extensive Presets",
              "Store Up to 100 Projects",
              "Compatible with MIDI Devices",
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
            isEnabled={auth.isVirtuoso}
            price={"$20 / month"}
            description="Go even further beyond."
            features={[
              "Desktop Application",
              "Sync With VST Plugin",
              "Access to All Presets",
              "Store Unlimited Projects",
              "Real-Time Collaboration",
              "Developer Love",
              "Request Any Feature",
            ]}
          />
        </m.div>
      </div>
    </LandingSection>
  );
};

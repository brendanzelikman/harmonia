import { LandingCard } from "features/Landing/components/LandingCard";
import { PopupHeader } from "features/Landing/components/LandingHeader";
import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import {
  GiMusicalScore,
  GiCalculator,
  GiMusicalKeyboard,
} from "react-icons/gi";

export const LandingDescription = () => {
  return (
    <LandingSection className="py-10 px-5">
      <PopupHeader title="Tonality At Your Fingertips." />
      <m.div
        className="w-full flex flex-wrap justify-center gap-16"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        transition={{ delayChildren: 0.2, staggerChildren: 0.25 }}
      >
        {categories.map((category) => (
          <LandingCard
            key={category}
            slide={50}
            title={descriptions[category].icon}
            description={category}
            features={descriptions[category].items}
          />
        ))}
      </m.div>
    </LandingSection>
  );
};

const descriptions = {
  "Digital Audio Workstation": {
    items: [
      "Local-First Sandbox Environment",
      "Read and Write Projects in JSON",
      "Export Data To MIDI and WAV",
      "Learn with Demos and Tutorials",
      "No Installation Or Setup Required",
    ],
    icon: <GiMusicalScore />,
  },
  "Voice Leading Calculator": {
    items: [
      "Cutting-Edge Musical Operations",
      "Scales with Hierarchical Structures",
      "Patterns with Harmonic Functions",
      "Poses with Multidimensional Logic",
      "Programmable JavaScript Effects",
    ],
    icon: <GiCalculator />,
  },
  "Virtual Musical Instrument": {
    items: [
      "Browser-Powered Audio Engine",
      "Custom Instruments and Effects",
      "Interactive Keyboard Gestures",
      "Record to MIDI and WAV",
      "Upload Your Own Samples",
    ],
    icon: <GiMusicalKeyboard />,
  },
};

const categories = Object.keys(descriptions) as Array<
  keyof typeof descriptions
>;

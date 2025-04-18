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
      <PopupHeader title="What is Harmonia?" />
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
  "Notation Program": {
    items: [
      "Software for Writing Music",
      "Projects Stored as JSON",
      "Autosaves to the Browser",
      "Export To MIDI and WAV",
      "No Installation Required",
    ],
    icon: <GiMusicalScore />,
  },
  "Tonality Calculator": {
    items: [
      "Software for Formulating Music",
      "Design Trees of Scales",
      "Bind Notes With Functions",
      "Create Formulated Poses",
      "Navigate Harmonic Spaces",
    ],
    icon: <GiCalculator />,
  },
  "Digital Instrument": {
    items: [
      "Software for Playing Music",
      "Interactive Keyboard Gestures",
      "Customizable Audio Effects",
      "Open-Source Sample Library",
      "Record Browser to WAV",
    ],
    icon: <GiMusicalKeyboard />,
  },
};

const categories = Object.keys(descriptions) as Array<
  keyof typeof descriptions
>;

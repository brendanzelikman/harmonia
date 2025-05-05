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
  "Sandbox Environment": {
    items: [
      "Compose Music in the Browser",
      "Read And Write JSON Projects",
      "Exportable To MIDI and WAV",
      "Demos and Samples Included",
      "No Sign-up or Login Required",
    ],
    icon: <GiMusicalScore />,
  },
  "Musical Calculator": {
    items: [
      "Express Tonal Syntax",
      "Create Trees of Scales",
      "Write Nested Patterns",
      "Explore Different Poses",
      "Apply Sequential Logic",
    ],
    icon: <GiCalculator />,
  },
  "Digital Instrument": {
    items: [
      "Make Sound in the Browser",
      "Interactive Keyboard Gestures",
      "Customizable Audio Effects",
      "Open-Source Sample Library",
      "Record Browser Playback",
    ],
    icon: <GiMusicalKeyboard />,
  },
};

const categories = Object.keys(descriptions) as Array<
  keyof typeof descriptions
>;

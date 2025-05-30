import { PopupHeader } from "features/Landing/components/LandingHeader";
import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import ReactImage from "assets/lib/react.png";
import TypescriptImage from "assets/lib/typescript.png";
import ReduxImage from "assets/lib/redux.png";
import ToneImage from "assets/lib/tone.png";
import OsmdImage from "assets/lib/osmd.png";
import FramerImage from "assets/lib/framer.png";
import TailwindImage from "assets/lib/tailwind.png";
import ViteSvg from "assets/lib/vite.svg";
import { Badge } from "./components/LandingBadge";

export const LandingLibraries = () => {
  return (
    <LandingSection className="p-12 bg-slate-950/50">
      <PopupHeader title="All In The Browser" />
      <m.div
        className="flex flex-wrap gap-y-12 pt-12"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
      >
        {libraries.map((option, index) => (
          <Badge key={option.title} {...option} index={index} />
        ))}
      </m.div>
    </LandingSection>
  );
};

const libraries = [
  {
    title: "Typescript",
    description: "Programming Language",
    image: TypescriptImage,
    link: "https://www.typescriptlang.org/",
    borderColor: "border-blue-600",
  },
  {
    title: "React",
    description: "Interface Library",
    image: ReactImage,
    link: "https://react.dev/",
    borderColor: "border-sky-600",
  },
  {
    title: "Redux",
    description: "State Management",
    image: ReduxImage,
    link: "https://redux.js.org/",
    borderColor: "border-purple-800",
  },
  {
    title: "Vite",
    description: "Development Server",
    image: ViteSvg,
    link: "https://vitejs.dev/",
    borderColor: "border-amber-500",
  },
  {
    title: "Tone",
    description: "Audio Engine",
    image: ToneImage,
    link: "https://tonejs.github.io/",
    borderColor: "border-teal-500",
  },
  {
    title: "Tailwind",
    description: "Styling Framework",
    image: TailwindImage,
    link: "https://tailwindcss.com/",
    borderColor: "border-cyan-500",
  },
  {
    title: "Framer",
    description: "Animation Library",
    image: FramerImage,
    link: "https://www.framer.com/docs/",
    borderColor: "border-cyan-500",
  },
  {
    title: "OSMD",
    description: "Sheet Music",
    image: OsmdImage,
    link: "https://opensheetmusicdisplay.org/",
    borderColor: "border-orange-500",
  },
];

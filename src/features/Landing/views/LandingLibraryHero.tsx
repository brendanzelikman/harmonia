import { m } from "framer-motion";
import {
  LandingSection,
  LandingLibraryBadge,
  LandingPopupHeader,
} from "../components";

import Background from "assets/images/landing-background.png";
import ReactImage from "assets/lib/react.png";
import TypescriptImage from "assets/lib/typescript.png";
import ReduxImage from "assets/lib/redux.png";
import ToneImage from "assets/lib/tone.png";
import TailwindImage from "assets/lib/tailwind.png";
import ElectronImage from "assets/lib/electron.png";
import FramerImage from "assets/lib/framer.png";
import ViteSvg from "assets/lib/vite.svg";

export const LandingLibraryHero = () => (
  <LandingSection className="justify-center text-white">
    <LandingPopupHeader title="Cutting-Edge Technology Discovered!" />
    <m.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, translateY: 50 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative rounded-xl bg-[rgb(15,20,40)] overflow-hidden ring backdrop-blur">
        <img
          className="absolute inset-0 opacity-20 pointer-events-none"
          src={Background}
        />
        <div className="flex flex-wrap py-16 gap-y-12 saturate-150">
          {libraryOptions.map((option, index) => (
            <LandingLibraryBadge key={option.title} {...option} index={index} />
          ))}
        </div>
      </div>
    </m.div>
  </LandingSection>
);

const libraryOptions = [
  {
    title: "React",
    description: "For Building User Interfaces",
    image: ReactImage,
    link: "https://react.dev/",
  },
  {
    title: "Typescript",
    description: "For Safety and Sanity",
    image: TypescriptImage,
    link: "https://www.typescriptlang.org/",
  },
  {
    title: "Redux",
    description: "For State Management",
    image: ReduxImage,
    link: "https://redux.js.org/",
  },
  {
    title: "Tone.js",
    description: "For Timing and Audio",
    image: ToneImage,
    link: "https://tonejs.github.io/",
  },
  {
    title: "Vite",
    description: "For Fast Development",
    image: ViteSvg,
    link: "https://vitejs.dev/",
  },
  {
    title: "Electron",
    description: "For Cross-Platform Distribution",
    image: ElectronImage,
    link: "https://www.electronjs.org/",
  },
  {
    title: "Tailwind",
    description: "For Style And Class",
    image: TailwindImage,
    link: "https://tailwindcss.com/",
  },
  {
    title: "Framer",
    description: "For Motion and Beauty",
    image: FramerImage,
    link: "https://www.framer.com/motion/",
  },
];

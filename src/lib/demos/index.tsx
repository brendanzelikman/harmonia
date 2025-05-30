import { BaseProject } from "app/reducer";
import Moonlight from "lib/demos/moonlight.json";
import Barry from "lib/demos/barry.json";
import Bird from "lib/demos/bird.json";
import Carousel from "lib/demos/carousel.json";
import Chat from "lib/demos/chat.json";
import Exalted from "lib/demos/exalted.json";
import Fonte from "lib/demos/fonte.json";
import Lavos from "lib/demos/lavos.json";
import Prelude from "lib/demos/prelude.json";
import Reminiscenza from "lib/demos/reminiscenza.json";
import Romanesca from "lib/demos/romanesca.json";
import Scherzo from "lib/demos/scherzo.json";
import Sentence from "lib/demos/sentence.json";
import Sketch from "lib/demos/sketch.json";
import Waterfall from "lib/demos/waterfall.json";
import Wave from "lib/demos/wave.json";
import WaveSnark from "lib/demos/waveAlt.json";
import WaveLong from "lib/demos/waveLong.json";
import { GiFire, GiQuill, GiTrumpet } from "react-icons/gi";

type DemoProject = {
  project: BaseProject;
  blurb: string;
};

const BarryDemo: DemoProject = {
  project: Barry as unknown as BaseProject,
  blurb: "A jazz solo based on a Barry Harris voicing.",
};
const BirdDemo: DemoProject = {
  project: Bird as unknown as BaseProject,
  blurb: "A jazz etude based on the Bird Changes.",
};
const CarouselDemo: DemoProject = {
  project: Carousel as unknown as BaseProject,
  blurb: "A turbulent pattern posing around.",
};
const ChatDemo: DemoProject = {
  project: Chat as unknown as BaseProject,
  blurb: "A short piece based on a ChatGPT progression.",
};
const ExaltedDemo: DemoProject = {
  project: Exalted as unknown as BaseProject,
  blurb: "One might call it a piano-based rock opera.",
};
const FonteDemo: DemoProject = {
  project: Fonte as unknown as BaseProject,
  blurb: "A playful solo over the Fonte progression.",
};
const LavosDemo: DemoProject = {
  project: Lavos as unknown as BaseProject,
  blurb: "An aggressive beat with a lot of energy.",
};
const MoonlightDemo: DemoProject = {
  project: Moonlight as unknown as BaseProject,
  blurb: "A few bars from Beethoven's Op. 27, No. 2.",
};
const PreludeDemo: DemoProject = {
  project: Prelude as unknown as BaseProject,
  blurb: "A full recreation of Bach's BWV 846.",
};
const ReminiscenzaDemo: DemoProject = {
  project: Reminiscenza as unknown as BaseProject,
  blurb: "A few bars from Medtner's Op. 38, No. 1.",
};
const RomanescaDemo: DemoProject = {
  project: Romanesca as unknown as BaseProject,
  blurb: "A stepwise variant of the Romanesca",
};
const ScherzoDemo: DemoProject = {
  project: Scherzo as unknown as BaseProject,
  blurb: "A short piece based on Mvt. 2 of Hammerklavier",
};
const SentenceDemo: DemoProject = {
  project: Sentence as unknown as BaseProject,
  blurb: "A musical sentence (short, short, long).",
};
const WaterfallDemo: DemoProject = {
  project: Waterfall as unknown as BaseProject,
  blurb: "A few bars from Chopin's Op. 10, No. 1.",
};
const SketchDemo: DemoProject = {
  project: Sketch as unknown as BaseProject,
  blurb: "A short piece based on a sketch of a melody.",
};
const WaveDemo: DemoProject = {
  project: Wave as unknown as BaseProject,
  blurb: "Piano and bass over a soothing progression.",
};
const WaveSnarkDemo: DemoProject = {
  project: WaveSnark as unknown as BaseProject,
  blurb: "The evil twin of Tidal Waves.",
};
const WaveLongDemo: DemoProject = {
  project: WaveLong as unknown as BaseProject,
  blurb: "An extended piece based on Wave.",
};

// Demo projects are organized by genre
export const DEMO_GENRES = [
  {
    key: "Templates",
    color: "border-sky-400 text-sky-400",
    icon: <GiQuill />,
    demos: [],
  },
  {
    key: "Classical",
    color: "border-sky-400 text-sky-400",
    icon: <GiQuill />,
    demos: [PreludeDemo, WaterfallDemo, MoonlightDemo, ReminiscenzaDemo],
  },
  {
    key: "Jazz",
    color: "border-orange-300 text-orange-300",
    icon: <GiTrumpet />,
    demos: [FonteDemo, BirdDemo, CarouselDemo, BarryDemo],
  },
  {
    key: "Electronic",
    color: "border-red-400 text-red-400",
    icon: <GiFire />,
    demos: [WaveDemo, WaveSnarkDemo, ExaltedDemo, LavosDemo],
  },
] as const;

export const DEMO_PROJECTS: DemoProject[] = DEMO_GENRES.flatMap(
  (genre) => genre.demos
);

export const DEMOS_BY_KEY: Record<string, DemoProject> = DEMO_PROJECTS.reduce(
  (acc, demo) => {
    acc[demo.project.meta.name.toLowerCase()] = demo;
    return acc;
  },
  {} as Record<string, DemoProject>
);

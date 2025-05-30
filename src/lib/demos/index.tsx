import { BaseProject } from "app/reducer";
import Sentence from "lib/demos/sentence.json";
import Moonlight from "lib/demos/moonlight.json";
import Waterfall from "lib/demos/waterfall.json";
import Reminiscenza from "lib/demos/reminiscenza.json";
import Robot from "lib/demos/chat.json";
import Prelude from "lib/demos/prelude.json";
import Scherzo from "lib/demos/scherzo.json";
import Barry from "lib/demos/barry.json";
import Bird from "lib/demos/bird.json";
import Carousel from "lib/demos/carousel.json";
import Fonte from "lib/demos/fonte.json";
import Exalted from "lib/demos/exalted.json";
import Wave from "lib/demos/wave.json";
import WaveSnark from "lib/demos/waveAlt.json";
import WaveLong from "lib/demos/waveLong.json";
import WaveWaltz from "lib/demos/waveWaltz.json";
import Lavos from "lib/demos/lavos.json";
import Romanesca from "lib/demos/romanesca.json";
import { GiFire, GiPianoKeys, GiQuill, GiTrumpet } from "react-icons/gi";

type DemoProject = {
  project: BaseProject;
  blurb: string;
};

const MoonlightDemo: DemoProject = {
  project: Moonlight as unknown as BaseProject,
  blurb: "A few bars from Mvt. 3 of the Moonlight Sonata",
};

const WaterfallDemo: DemoProject = {
  project: Waterfall as unknown as BaseProject,
  blurb: "A few bars from Chopin's Etude Op. 10, No. 1",
};

const ReminiscenzaDemo: DemoProject = {
  project: Reminiscenza as unknown as BaseProject,
  blurb: "A few bars from Medtner's Sonata-Reminiscenza.",
};

export const PreludeDemo: DemoProject = {
  project: Prelude as unknown as BaseProject,
  blurb: "The famous Prelude in C Major by Bach.",
};

const RobotDemo: DemoProject = {
  project: Robot as unknown as BaseProject,
  blurb: "A short piece based on a ChatGPT progression.",
};

const RomanescaDemo: DemoProject = {
  project: Romanesca as unknown as BaseProject,
  blurb: "A stepwise variant of the Romanesca",
};

const SentenceDemo: DemoProject = {
  project: Sentence as unknown as BaseProject,
  blurb: "A musical sentence (short, short, long).",
};

const ScherzoDemo: DemoProject = {
  project: Scherzo as unknown as BaseProject,
  blurb: "A short piece based on Mvt. 2 of Hammerklavier",
};

const BirdDemo: DemoProject = {
  project: Bird as unknown as BaseProject,
  blurb: "A short piece based on the Bird Changes.",
};

const BarryDemo: DemoProject = {
  project: Barry as unknown as BaseProject,
  blurb: "Fly Me to the Moon with a Barry Harris voicing.",
};

const WaveDemo: DemoProject = {
  project: Wave as unknown as BaseProject,
  blurb: "Arpeggios and chords moving by fifths.",
};

const WaveSnarkDemo: DemoProject = {
  project: WaveSnark as unknown as BaseProject,
  blurb: "An alternate chord progression for Wave.",
};
const WaveLongDemo: DemoProject = {
  project: WaveLong as unknown as BaseProject,
  blurb: "An extended piece based on Wave.",
};
const WaveWaltzDemo: DemoProject = {
  project: WaveWaltz as unknown as BaseProject,
  blurb: "A waltz-like interpretation of Wave.",
};
const CarouselDemo: DemoProject = {
  project: Carousel as unknown as BaseProject,
  blurb: "A turbulent pattern posing around.",
};

const FonteDemo: DemoProject = {
  project: Fonte as unknown as BaseProject,
  blurb: "A playful solo over the Fonte progression.",
};

const ExaltedDemo: DemoProject = {
  project: Exalted as unknown as BaseProject,
  blurb: "A glimpse of a large-scale project.",
};

const LavosDemo: DemoProject = {
  project: Lavos as unknown as BaseProject,
  blurb: "An aggressive breakcore project.",
};

// Demo projects are organized by genre
export const DEMO_GENRES = [
  {
    key: "Classical",
    color: "border-sky-400 text-sky-400",
    icon: <GiQuill />,
    demos: [
      PreludeDemo,
      ScherzoDemo,
      MoonlightDemo,
      WaterfallDemo,
      ReminiscenzaDemo,
    ],
  },
  {
    key: "Jazz",
    color: "border-orange-300 text-orange-300",
    icon: <GiTrumpet />,
    demos: [FonteDemo, BirdDemo, CarouselDemo, BarryDemo],
  },
  {
    key: "Ambient",
    color: "border-emerald-400 text-emerald-400",
    icon: <GiPianoKeys />,
    demos: [
      WaveDemo,
      // WaveSnarkDemo, WaveWaltzDemo, WaveLongDemo
    ],
  },
  {
    key: "Techno",
    color: "border-red-400 text-red-400",
    icon: <GiFire />,
    demos: [ExaltedDemo, LavosDemo],
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

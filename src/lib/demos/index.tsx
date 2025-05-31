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
import Sin from "lib/demos/bach_sin.json";
import Cos from "lib/demos/bach_cos.json";
import Tan from "lib/demos/bach_tan.json";
import Log from "lib/demos/bach_log.json";
import Exp from "lib/demos/bach_exp.json";
import Waterfall from "lib/demos/waterfall.json";
import Wave from "lib/demos/wave.json";
import WaveSnark from "lib/demos/waveAlt.json";
import WaveLong from "lib/demos/waveLong.json";
import { GiFire, GiQuill, GiTrumpet } from "react-icons/gi";

type DemoProject = {
  project: BaseProject;
  blurb: string;
  aliases?: string[];
};

const BarryDemo: DemoProject = {
  project: Barry as unknown as BaseProject,
  blurb: "A fun chorus with a Barry Harris voicing.",
  aliases: ["barry"],
};
const BirdDemo: DemoProject = {
  project: Bird as unknown as BaseProject,
  blurb: "An arpeggio through Charlie Parker chords.",
  aliases: ["bird"],
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
  blurb: "A playful riff over the Fonte progression.",
  aliases: ["fonte"],
};
const LavosDemo: DemoProject = {
  project: Lavos as unknown as BaseProject,
  blurb: "An experimental hardcore techno beat.",
  aliases: ["lavos", "techno"],
};
const MoonlightDemo: DemoProject = {
  project: Moonlight as unknown as BaseProject,
  blurb: "A few bars from Beethoven's Op. 27, No. 2.",
  aliases: ["moonlight", "beethoven"],
};
const PreludeDemo: DemoProject = {
  project: Prelude as unknown as BaseProject,
  blurb: "A recreation of that famous piece by Bach.",
  aliases: ["bach", "prelude"],
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
const SinDemo: DemoProject = {
  project: Sin as unknown as BaseProject,
  blurb: "Bach's Prelude summed with a sine wave.",
  aliases: ["sine", "sin"],
};
const CosDemo: DemoProject = {
  project: Cos as unknown as BaseProject,
  blurb: "Bach's Prelude summed with a cosine wave.",
  aliases: ["cosine", "cos"],
};
const TanDemo: DemoProject = {
  project: Tan as unknown as BaseProject,
  blurb: "Bach's Prelude summed with a tangent wave.",
  aliases: ["tangent", "tan"],
};
const ExpDemo: DemoProject = {
  project: Exp as unknown as BaseProject,
  blurb: "Bach's Prelude with exponential growth.",
  aliases: ["exponential", "exp", "euler"],
};
const LogDemo: DemoProject = {
  project: Exp as unknown as BaseProject,
  blurb: "Bach's Prelude with logarithmic growth.",
  aliases: ["logarithm", "log"],
};
const SketchDemo: DemoProject = {
  project: Sketch as unknown as BaseProject,
  blurb: "A short piece based on a sketch of a melody.",
};
const WaterfallDemo: DemoProject = {
  project: Waterfall as unknown as BaseProject,
  blurb: "A few bars from Chopin's Op. 10, No. 1.",
  aliases: ["chopin", "waterfall", "etude"],
};
const WaveDemo: DemoProject = {
  project: Wave as unknown as BaseProject,
  blurb: "Piano and bass over a soothing progression.",
  aliases: ["wave"],
};
const WaveSnarkDemo: DemoProject = {
  project: WaveSnark as unknown as BaseProject,
  blurb: "The evil twin of Tidal Waves.",
  aliases: ["snark"],
};
const WaveLongDemo: DemoProject = {
  project: WaveLong as unknown as BaseProject,
  blurb: "An extended piece based on Wave.",
};

// Demo projects are organized by genre
export const DEMO_GENRES = [
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
  {
    key: "Mathematical",
    color: "border-red-400 text-red-400",
    icon: <GiFire />,
    demos: [SinDemo, CosDemo, TanDemo],
  },
] as const;

export const DEMO_PROJECTS: DemoProject[] = DEMO_GENRES.flatMap(
  (genre) => genre.demos
);

export const DEMOS_BY_KEY: Record<string, DemoProject> = DEMO_PROJECTS.reduce(
  (acc, demo) => {
    acc[demo.project.meta.name.toLowerCase()] = demo;
    if (demo.aliases) {
      demo.aliases.forEach((alias) => {
        acc[alias.toLowerCase()] = demo;
      });
    }
    return acc;
  },
  {} as Record<string, DemoProject>
);

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
import Sin from "lib/demos/sin.json";
import Cos from "lib/demos/cos.json";
import Tan from "lib/demos/tan.json";
import BachSin from "lib/demos/bach_sin.json";
import BachCos from "lib/demos/bach_cos.json";
import BachTan from "lib/demos/bach_tan.json";
import BachPi from "lib/demos/bach_pi.json";
import ClusterVsChord from "lib/demos/bach_cluster.json";
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

// -----------------------------------
// Classical
// -----------------------------------

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
const WaterfallDemo: DemoProject = {
  project: Waterfall as unknown as BaseProject,
  blurb: "A few bars from Chopin's Op. 10, No. 1.",
  aliases: ["chopin", "waterfall", "etude"],
};
const ScherzoDemo: DemoProject = {
  project: Scherzo as unknown as BaseProject,
  blurb: "A short piece based on Beethoven's Op. 106.",
};

// -------------------------------------
// Jazz
// -------------------------------------

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
const FonteDemo: DemoProject = {
  project: Fonte as unknown as BaseProject,
  blurb: "A playful riff over the Fonte progression.",
  aliases: ["fonte"],
};
const RomanescaDemo: DemoProject = {
  project: Romanesca as unknown as BaseProject,
  blurb: "A swung variant of the Romanesca",
};

// -------------------------------------
// Electronic
// -------------------------------------

const ExaltedDemo: DemoProject = {
  project: Exalted as unknown as BaseProject,
  blurb: "One might call it a piano-based rock opera.",
};
const LavosDemo: DemoProject = {
  project: Lavos as unknown as BaseProject,
  blurb: "An experimental hardcore techno beat.",
  aliases: ["lavos", "techno"],
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

// -------------------------------------
// Basic Templates
// -------------------------------------

const ChatDemo: DemoProject = {
  project: Chat as unknown as BaseProject,
  blurb: "A short piece based on a ChatGPT progression.",
};

const SentenceDemo: DemoProject = {
  project: Sentence as unknown as BaseProject,
  blurb: "A musical sentence (short, short, long).",
};
const SketchDemo: DemoProject = {
  project: Sketch as unknown as BaseProject,
  blurb: "A short piece based on a sketch of a melody.",
};

// -------------------------------------
// Basic Scripts
// -------------------------------------
const SinDemo: DemoProject = {
  project: Sin as unknown as BaseProject,
  blurb: "A pattern oscillating through a sine wave.",
  aliases: ["sin"],
};
const CosDemo: DemoProject = {
  project: Cos as unknown as BaseProject,
  blurb: "A pattern oscillating through a cosine wave.",
  aliases: ["cos"],
};
const TanDemo: DemoProject = {
  project: Tan as unknown as BaseProject,
  blurb: "A pattern oscillating through a tangent wave.",
  aliases: ["tan"],
};

// -------------------------------------
// Bach with Math
// -------------------------------------

const BachSinDemo: DemoProject = {
  project: BachSin as unknown as BaseProject,
  blurb: "Bach's Prelude slowly summed from 0 to +1.",
  aliases: ["bach_sin"],
};
const BachCosDemo: DemoProject = {
  project: BachCos as unknown as BaseProject,
  blurb: "Bach's Prelude slowly dropped from +1 to 0.",
  aliases: ["bach_cos"],
};
const BachTanDemo: DemoProject = {
  project: BachTan as unknown as BaseProject,
  blurb: `Bach's Prelude slowly raised up to "Infinity".`,
  aliases: ["bach_tan"],
};
const BachPiDemo: DemoProject = {
  project: BachPi as unknown as BaseProject,
  blurb: "Bach's Prelude in intervals of 3.1415...",
  aliases: ["bach_pi"],
};
const ClusterVsChordDemo: DemoProject = {
  project: ClusterVsChord as unknown as BaseProject,
  blurb: "Bach's prelude with clusters, then chords.",
  aliases: ["bach_clusters", "bach_chords", "bach_battle"],
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
    key: "Basic Scripts",
    color: "border-red-400 text-red-400",
    icon: <GiFire />,
    demos: [SinDemo, CosDemo, TanDemo],
  },
  {
    key: "Bach with Math",
    color: "border-red-400 text-red-400",
    icon: <GiFire />,
    demos: [
      BachPiDemo,
      BachSinDemo,
      BachCosDemo,
      BachTanDemo,
      ClusterVsChordDemo,
    ],
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

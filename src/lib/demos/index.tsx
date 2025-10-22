import { BaseProject } from "app/reducer";
import Moonlight from "lib/demos/moonlight.json";
import Barry from "lib/demos/barry.json";
import Bird from "lib/demos/bird.json";
import Carousel from "lib/demos/carousel.json";
import Chat from "lib/demos/chat.json";
import Exalted from "lib/demos/exalted.json";
import Fonte from "lib/demos/fonte.json";
import Groove from "lib/demos/groove.json";
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
import GameBarry from "lib/demos/game_barry.json";
import Tour from "lib/demos/tour.json";
import GameCool from "lib/demos/game_cool.json";
import GameMoonlight from "lib/demos/game_moonlight.json";
import GameWave from "lib/demos/game_wave.json";
import GameGroove from "lib/demos/game_groove.json";
import Scriabinism from "lib/demos/scriabinism.json";

import RomanescaImage from "assets/images/demos/romanesca.png";
import SentenceImage from "assets/images/demos/sentence.png";
import SketchImage from "assets/images/demos/sketch.png";

import PreludeImage from "assets/images/demos/prelude.png";
import ScherzoImage from "assets/images/demos/scherzo.png";
import ReminiscenzaImage from "assets/images/demos/reminiscenza.png";

import ExaltedImage from "assets/images/demos/exalted.png";
import LavosImage from "assets/images/demos/lavos.png";
import ScriabinismImage from "assets/images/demos/scriabinism.png";
import WaveImage from "assets/images/demos/wave.png";

import CarouselImage from "assets/images/demos/carousel.png";
import FonteImage from "assets/images/demos/fonte.png";
import GrooveImage from "assets/images/demos/groove.png";
import BarryImage from "assets/images/demos/barry.png";

import SineImage from "assets/images/demos/sine.png";
import BachTanImage from "assets/images/demos/bach_tan.png";
import ClusterImage from "assets/images/demos/clusters.png";

type DemoProject = {
  project: BaseProject;
  blurb: string;
  aliases?: string[];
  image?: string;
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
  blurb: "A recreation of Bach's C Major Prelude.",
  aliases: ["bach", "prelude"],
  image: PreludeImage,
};
const ReminiscenzaDemo: DemoProject = {
  project: Reminiscenza as unknown as BaseProject,
  blurb: "A few bars from Medtner's Op. 38, No. 1.",
  aliases: ["medtner", "reminiscenza"],
  image: ReminiscenzaImage,
};
const WaterfallDemo: DemoProject = {
  project: Waterfall as unknown as BaseProject,
  blurb: "A few bars from Chopin's Op. 10, No. 1.",
  aliases: ["chopin", "waterfall", "etude"],
};
const ScherzoDemo: DemoProject = {
  project: Scherzo as unknown as BaseProject,
  aliases: ["scherzo"],
  blurb: "A short piece based on Beethoven's Op. 106.",
  image: ScherzoImage,
};

// -------------------------------------
// Jazz
// -------------------------------------

const BarryDemo: DemoProject = {
  project: Barry as unknown as BaseProject,
  blurb: "A fun chorus based on a Barry Harris voicing.",
  aliases: ["barry"],
  image: BarryImage,
};
const GrooveDemo: DemoProject = {
  project: Groove as unknown as BaseProject,
  blurb: `An "groovy" improvisation over a ""jazz"" beat.`,
  aliases: ["groove"],
  image: GrooveImage,
};
const BirdDemo: DemoProject = {
  project: Bird as unknown as BaseProject,
  blurb: "An arpeggio through Charlie Parker chords.",
  aliases: ["bird"],
};
const CarouselDemo: DemoProject = {
  project: Carousel as unknown as BaseProject,
  blurb: "A turbulent pattern posing around as three.",
  aliases: ["carousel"],
  image: CarouselImage,
};
const FonteDemo: DemoProject = {
  project: Fonte as unknown as BaseProject,
  blurb: "A playful riff based on the famous schema.",
  aliases: ["fonte"],
  image: FonteImage,
};
const RomanescaDemo: DemoProject = {
  project: Romanesca as unknown as BaseProject,
  blurb: "A simple and popular descending pattern.",
  image: RomanescaImage,
};

// -------------------------------------
// Electronic
// -------------------------------------

const ExaltedDemo: DemoProject = {
  project: Exalted as unknown as BaseProject,
  blurb: "One could call it a piano-based rock opera.",
  aliases: ["exalted"],
  image: ExaltedImage,
};
const LavosDemo: DemoProject = {
  project: Lavos as unknown as BaseProject,
  blurb: "An experimental hardcore techno beat.",
  aliases: ["lavos", "techno"],
  image: LavosImage,
};
const WaveDemo: DemoProject = {
  project: Wave as unknown as BaseProject,
  blurb: "Piano and bass over a soothing progression.",
  aliases: ["wave"],
  image: WaveImage,
};
const WaveSnarkDemo: DemoProject = {
  project: WaveSnark as unknown as BaseProject,
  blurb: "The evil twin of Tidal Waves.",
  aliases: ["snark"],
};
const WaveLongDemo: DemoProject = {
  project: WaveLong as unknown as BaseProject,
  blurb: "An extended piece in the Wave family.",
};
const ScriabinismDemo: DemoProject = {
  project: Scriabinism as unknown as BaseProject,
  blurb: "A piece based on Scriabin's Sonata No. 5.",
  aliases: ["scriabinism", "scriabin"],
  image: ScriabinismImage,
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
  image: SentenceImage,
};
const SketchDemo: DemoProject = {
  project: Sketch as unknown as BaseProject,
  blurb: "A short piece based on a sketch of a melody.",
  aliases: ["sketch"],
  image: SketchImage,
};

// -------------------------------------
// Basic Scripts
// -------------------------------------
const SinDemo: DemoProject = {
  project: Sin as unknown as BaseProject,
  blurb: "A pattern oscillating through a sine wave.",
  aliases: ["sine"],
  image: SineImage,
};
const CosDemo: DemoProject = {
  project: Cos as unknown as BaseProject,
  blurb: "A pattern oscillating through a cosine wave.",
  aliases: ["cosine"],
};
const TanDemo: DemoProject = {
  project: Tan as unknown as BaseProject,
  blurb: "A pattern oscillating through a tangent wave.",
  aliases: ["tangent"],
};

// -------------------------------------
// Rhythm Games
// -------------------------------------
const GameBarryDemo: DemoProject = {
  project: GameBarry as unknown as BaseProject,
  blurb: "An improvisation over Fly Me to the Moon.",
  aliases: ["game_barry", "barry_game"],
};
const GameGrooveDemo: DemoProject = {
  project: GameGroove as unknown as BaseProject,
  blurb: "The rhythm game of A Groove.",
  aliases: ["game_groove", "groove_game"],
};
const TourDemo: DemoProject = {
  project: Tour as unknown as BaseProject,
  blurb: "An improvisation over Fly Me to the Moon.",
  aliases: ["tour"],
};
const GameCoolDemo: DemoProject = {
  project: GameCool as unknown as BaseProject,
  blurb: "The rhythm game of Cool Beat.",
  aliases: ["game_cool", "cool_game"],
};
const GameMoonlightDemo: DemoProject = {
  project: GameMoonlight as unknown as BaseProject,
  blurb: "The rhythm game of Moonlight Sonata, Mvt. 3.",
  aliases: ["game_moonlight", "moonlight_game"],
};
const GameWaveDemo: DemoProject = {
  project: GameWave as unknown as BaseProject,
  blurb: "The rhythm game of Tidal Waves.",
  aliases: ["game_wave", "wave_game"],
};

// -------------------------------------
// Bach with Math
// -------------------------------------

const BachSinDemo: DemoProject = {
  project: BachSin as unknown as BaseProject,
  blurb: "Bach's Prelude slowly summed from 0 to 1.",
  aliases: ["bach_sin"],
};
const BachCosDemo: DemoProject = {
  project: BachCos as unknown as BaseProject,
  blurb: "Bach's Prelude slowly dropped from 1 to 0.",
  aliases: ["bach_cos"],
};
const BachTanDemo: DemoProject = {
  project: BachTan as unknown as BaseProject,
  blurb: `Bach's Prelude slowly raised up to "Infinity".`,
  aliases: ["bach_tan"],
  image: BachTanImage,
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
  image: ClusterImage,
};

// Demo projects are organized by genre
export const DEMO_GENRES = [
  {
    key: "Introductory",
    color: "border-green-400 text-green-400",
    demos: [RomanescaDemo, SentenceDemo, SketchDemo],
  },
  {
    key: "Classical",
    color: "border-sky-400 text-sky-400",
    demos: [
      PreludeDemo,
      WaterfallDemo,
      ScherzoDemo,
      MoonlightDemo,
      ReminiscenzaDemo,
    ],
  },
  {
    key: "Jazz",
    color: "border-orange-300 text-orange-300",
    demos: [FonteDemo, BirdDemo, CarouselDemo, BarryDemo, GrooveDemo],
  },
  {
    key: "Electronic",
    color: "border-red-400 text-red-400",
    demos: [
      WaveDemo,
      WaveSnarkDemo,
      WaveLongDemo,
      ScriabinismDemo,
      ExaltedDemo,
      LavosDemo,
    ],
  },
  {
    key: "Basic Scripts",
    color: "border-red-400 text-red-400",
    demos: [SinDemo, CosDemo, TanDemo],
  },
  {
    key: "Rhythm Games",
    color: "border-red-400 text-red-400",
    demos: [GameWaveDemo, GameBarryDemo, GameGrooveDemo, GameMoonlightDemo],
  },
  {
    key: "Math Remixes",
    color: "border-red-400 text-red-400",
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
        acc[alias] = demo;
      });
    }
    return acc;
  },
  {} as Record<string, DemoProject>
);

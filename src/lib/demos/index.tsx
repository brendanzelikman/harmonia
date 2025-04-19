import { BaseProject } from "app/reducer";
import Sentence from "lib/demos/sentence.json";
import Moonlight from "lib/demos/moonlight.json";
import Robot from "lib/demos/chat.json";
import Prelude from "lib/demos/prelude.json";
import Scherzo from "lib/demos/scherzo.json";
import Barry from "lib/demos/barry.json";
import Bird from "lib/demos/bird.json";
import Waves from "lib/demos/waves.json";
import Sheep from "lib/demos/sheep.json";
import Exalted from "lib/demos/exalted.json";
import Hyper from "lib/demos/hyper.json";
import Lavos from "lib/demos/lavos.json";
import {
  GiFire,
  GiPianoKeys,
  GiQuill,
  GiRetroController,
  GiTrumpet,
} from "react-icons/gi";

type DemoProject = {
  project: BaseProject;
  blurb: string;
};

const MoonlightDemo: DemoProject = {
  project: Moonlight as unknown as BaseProject,
  blurb: "A few bars from Mvt. 3 of the Moonlight Sonata",
};

const PreludeDemo: DemoProject = {
  project: Prelude as unknown as BaseProject,
  blurb: "A short piece imitating Chopin's Prelude in C major.",
};

const RobotDemo: DemoProject = {
  project: Robot as unknown as BaseProject,
  blurb: "A short piece based on a ChatGPT progression.",
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

const WavesDemo: DemoProject = {
  project: Waves as unknown as BaseProject,
  blurb: "Arpeggios and chords moving by fifths.",
};

const SheepDemo: DemoProject = {
  project: Sheep as unknown as BaseProject,
  blurb: "A turbulent pattern posing around.",
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
    icon: <GiPianoKeys />,
    demos: [SentenceDemo, RobotDemo, MoonlightDemo],
  },
  {
    key: "Romantic",
    color: "border-indigo-300 text-indigo-300",
    icon: <GiQuill />,
    demos: [PreludeDemo, ScherzoDemo],
  },
  {
    key: "Jazz",
    color: "border-orange-300 text-orange-300",
    icon: <GiTrumpet />,
    demos: [BirdDemo, BarryDemo],
  },
  {
    key: "Electronic",
    color: "border-emerald-300 text-emerald-300",
    icon: <GiRetroController />,
    demos: [WavesDemo, SheepDemo],
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

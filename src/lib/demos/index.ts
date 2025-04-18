import { BaseProject } from "app/reducer";
import Moonlight from "lib/demos/moonlight.json";
import Prelude from "lib/demos/prelude.json";
import Scherzo from "lib/demos/scherzo.json";
import Barry from "lib/demos/barry.json";
import Waves from "lib/demos/waves.json";
import Waltz from "lib/demos/waltz.json";
import Sheep from "lib/demos/sheep.json";
import Exalted from "lib/demos/exalted.json";
import Hyper from "lib/demos/hyper.json";

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

const ScherzoDemo: DemoProject = {
  project: Scherzo as unknown as BaseProject,
  blurb: "A short piece based on Mvt. 2 of Hammerklavier",
};

const WaltzDemo: DemoProject = {
  project: Waltz as unknown as BaseProject,
  blurb: "A waltz with interesting effects.",
};

const BarryDemo: DemoProject = {
  project: Barry as unknown as BaseProject,
  blurb: "A warmup based on a Barry Harris voicing.",
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

const HyperDemo: DemoProject = {
  project: Hyper as unknown as BaseProject,
  blurb: "An aggressive breakcore project.",
};

export const DEMO_PROJECTS: DemoProject[] = [
  MoonlightDemo,
  PreludeDemo,
  ScherzoDemo,
  WaltzDemo,
  BarryDemo,
  WavesDemo,
  SheepDemo,
  ExaltedDemo,
  HyperDemo,
];

// Demo projects are organized by genre
export const DEMO_GENRES = [
  {
    key: "Classical",
    color: "border-sky-400 text-sky-400",
    demos: [MoonlightDemo, ScherzoDemo],
  },
  {
    key: "Romantic",
    color: "border-indigo-300 text-indigo-300",
    demos: [PreludeDemo, WaltzDemo],
  },
  {
    key: "Jazz",
    color: "border-orange-300 text-orange-300",
    demos: [BarryDemo],
  },
  {
    key: "Electronica",
    color: "border-emerald-300 text-emerald-300",
    demos: [WavesDemo, SheepDemo, ExaltedDemo],
  },
  {
    key: "Techno",
    color: "border-red-400 text-red-400",
    demos: [HyperDemo],
  },
] as const;

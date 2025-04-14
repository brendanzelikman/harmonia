import { BaseProject } from "app/reducer";
import Prelude from "lib/demos/prelude.json";
import Scherzo from "lib/demos/scherzo.json";
import Moonlight from "lib/demos/moonlight.json";
import Waves from "lib/demos/waves.json";
import Sheep from "lib/demos/sheep.json";
import Exalted from "lib/demos/exalted.json";

export const DEMO_PROJECTS = [
  {
    project: Prelude as unknown as BaseProject,
    type: "Classical",
    colors: "border-rose-300 text-rose-300",
    blurb: "A short piece imitating the Western classical style.",
  },
  {
    project: Scherzo as unknown as BaseProject,
    type: "Classical",
    colors: "border-purple-300 text-purple-300",
    blurb: "A short piece based on Mvt. 2 of Hammerklavier",
  },
  {
    project: Moonlight as unknown as BaseProject,
    type: "Classical",
    colors: "border-slate-300 text-slate-300",
    blurb: "A few bars from Mvt. 3 of the Moonlight Sonata",
  },
  {
    project: Waves as unknown as BaseProject,
    type: "Electronica",
    colors: "border-fuchsia-300 text-fuchsia-300",
    blurb: "An arpeggio and bassline in motion.",
  },
  {
    project: Sheep as unknown as BaseProject,
    type: "Electronica",
    colors: "border-indigo-300 text-indigo-300",
    blurb: "A glimpse of a large-scale project.",
  },
  {
    project: Exalted as unknown as BaseProject,
    type: "Electronica",
    colors: "border-sky-300 text-sky-300",
    blurb: "A glimpse of a large-scale project.",
  },
];

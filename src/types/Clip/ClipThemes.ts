import { Color } from "types/units";

export const CLIP_COLORS = [
  "red",
  "orange",
  "brown",
  "yellow",
  "lime",
  "green",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "fuchsia",
  "pink",
  "slate",
  "gray",
  "zinc",
];
export type ClipColor = (typeof CLIP_COLORS)[number];
export const DEFAULT_CLIP_COLOR: ClipColor = "sky";

/** A curated color palette for a Clip using Tailwind CSS color names. */
export interface ClipTheme {
  headerColor: Color;
  bodyColor: Color;
  noteColor: Color;
  iconColor: Color;
}

/** A map of clip colors to their respective themes. */
export const CLIP_THEMES: Record<ClipColor, ClipTheme> = {
  red: {
    headerColor: "bg-red-800",
    bodyColor: "bg-red-500/70",
    noteColor: "bg-red-800",
    iconColor: "bg-red-600",
  },
  orange: {
    headerColor: "bg-orange-700",
    bodyColor: "bg-orange-400/70",
    noteColor: "bg-orange-700",
    iconColor: "bg-orange-500",
  },
  brown: {
    headerColor: "bg-amber-900",
    bodyColor: "bg-amber-700/70",
    noteColor: "bg-amber-900",
    iconColor: "bg-amber-800",
  },
  yellow: {
    headerColor: "bg-yellow-600",
    bodyColor: "bg-yellow-400/70",
    noteColor: "bg-yellow-600/80",
    iconColor: "bg-yellow-500",
  },
  lime: {
    headerColor: "bg-lime-900",
    bodyColor: "bg-lime-500/70",
    noteColor: "bg-lime-800",
    iconColor: "bg-lime-600",
  },
  green: {
    headerColor: "bg-emerald-900",
    bodyColor: "bg-emerald-700/70",
    noteColor: "bg-emerald-900",
    iconColor: "bg-emerald-600",
  },
  cyan: {
    headerColor: "bg-cyan-900",
    bodyColor: "bg-cyan-600/70",
    noteColor: "bg-cyan-800",
    iconColor: "bg-cyan-500",
  },
  sky: {
    headerColor: "bg-slate-900/80",
    bodyColor: "bg-sky-700/70",
    noteColor: "bg-sky-950",
    iconColor: "bg-sky-700",
  },
  blue: {
    headerColor: "bg-blue-950",
    bodyColor: "bg-blue-600/70",
    noteColor: "bg-blue-800",
    iconColor: "bg-blue-600",
  },
  indigo: {
    headerColor: "bg-indigo-950",
    bodyColor: "bg-indigo-700/70",
    noteColor: "bg-indigo-900",
    iconColor: "bg-indigo-600",
  },
  fuchsia: {
    headerColor: "bg-fuchsia-950",
    bodyColor: "bg-fuchsia-700/70",
    noteColor: "bg-fuchsia-900",
    iconColor: "bg-fuchsia-700",
  },
  pink: {
    headerColor: "bg-pink-800",
    bodyColor: "bg-pink-400/70",
    noteColor: "bg-pink-800",
    iconColor: "bg-pink-500",
  },
  slate: {
    headerColor: "bg-slate-600",
    bodyColor: "bg-slate-400/70",
    noteColor: "bg-slate-500",
    iconColor: "bg-slate-400",
  },
  gray: {
    headerColor: "bg-gray-700",
    bodyColor: "bg-gray-500/70",
    noteColor: "bg-gray-700",
    iconColor: "bg-gray-700",
  },
  zinc: {
    headerColor: "bg-zinc-950",
    bodyColor: "bg-zinc-600/70",
    noteColor: "bg-zinc-900",
    iconColor: "bg-zinc-900",
  },
};
export const DEFAULT_CLIP_THEME = CLIP_THEMES[DEFAULT_CLIP_COLOR];

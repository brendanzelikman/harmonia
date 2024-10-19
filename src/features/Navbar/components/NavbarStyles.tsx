import { GiPaintBrush, GiCrystalWand, GiDominoMask } from "react-icons/gi";

export const toolkitBackground = {
  pattern: "bg-gradient-radial from-emerald-500/20 to-emerald-500/5",
  pose: "bg-gradient-radial from-fuchsia-500/20 to-fuchsia-500/5",
  scale: "bg-gradient-radial from-sky-500/20 to-sky-500/5",
};

export const toolkitMotifBorder = {
  pattern: "border-emerald-500",
  pose: "border-pink-500",
  scale: "border-sky-500",
};

export const toolkitMotifBackground = {
  pattern: "bg-emerald-600/80",
  pose: "bg-pink-500/80",
  scale: "bg-sky-600/80",
};

export const toolkitMotifText = {
  pattern: "text-emerald-300",
  pose: "text-pink-300",
  scale: "text-sky-300",
};

export const toolkitClipBorder = {
  pattern: "border-teal-500",
  pose: "border-fuchsia-500",
  scale: "border-cyan-500",
};

export const toolkitClipBackground = {
  pattern: "bg-gradient-radial from-pattern-clip/40 to-pattern-clip/90",
  pose: "bg-gradient-radial from-pose-clip/40 to-pose-clip/90",
  scale: "bg-gradient-radial from-cyan-500/40 to-cyan-500/90",
};

export const toolkitClipText = {
  pattern: "text-teal-400",
  pose: "text-fuchsia-400",
  scale: "text-blue-400",
};

export const toolkitToolName = {
  pattern: "Brush",
  pose: "Wand",
  scale: "Mask",
};

export const toolkitToolIcon = {
  pattern: <GiPaintBrush />,
  pose: <GiCrystalWand />,
  scale: <GiDominoMask />,
};

import { GiPaintBrush, GiCrystalWand, GiDominoMask } from "react-icons/gi";

export const toolkitBackground = {
  pattern: "bg-emerald-800/10",
  pose: "bg-pink-500/10",
  scale: "bg-sky-800/10",
};

export const toolkitMotifBorder = {
  pattern: "border-emerald-500",
  pose: "border-pink-500",
  scale: "border-sky-500",
};

export const toolkitMotifBackground = {
  pattern: "bg-emerald-600",
  pose: "bg-pink-500",
  scale: "bg-sky-600",
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
  pattern: "bg-pattern-clip/80",
  pose: "bg-pose-clip/80",
  scale: "bg-cyan-500/80",
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
  pattern: <GiPaintBrush className="rotate-90" />,
  pose: <GiCrystalWand className="-rotate-90" />,
  scale: <GiDominoMask />,
};

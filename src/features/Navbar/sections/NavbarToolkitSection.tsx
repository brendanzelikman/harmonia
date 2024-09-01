import pluralize from "pluralize";
import { ClipType } from "types/Clip/ClipTypes";
import { use } from "types/hooks";
import { selectTimeline } from "types/Timeline/TimelineSelectors";
import { NavbarGroup } from "../components";
import { NavbarArrangeClipButton } from "./Toolkit/NavbarArrangeClipButton";
import { NavbarChangeTypeButton } from "./Toolkit/NavbarChangeTypeButton";
import { NavbarCreateMotifButton } from "./Toolkit/NavbarCreateMotifButton";
import { NavbarEditMotifButton } from "./Toolkit/NavbarEditMotifButton";
import { NavbarMotifListbox } from "./Toolkit/NavbarMotifListbox";
import { NavbarTypeInfoButton } from "./Toolkit/NavbarTypeInfoButton";

export function NavbarToolkitSection() {
  const timeline = use(selectTimeline);
  const type = timeline.type;
  if (!type) return null;

  const types = pluralize(type, 2);

  const background = {
    pattern: "bg-emerald-800/10",
    pose: "bg-pink-500/10",
    scale: "bg-sky-800/10",
  }[type];

  const motifBorder = {
    pattern: "border-emerald-500",
    pose: "border-pink-500",
    scale: "border-sky-500",
  }[type];

  const motifBackground = {
    pattern: "bg-emerald-600",
    pose: "bg-pink-500",
    scale: "bg-sky-600",
  }[type];

  const motifText = {
    pattern: "text-emerald-300",
    pose: "text-pink-300",
    scale: "text-sky-300",
  }[type];

  const clipBorder = {
    pattern: "border-teal-500",
    pose: "border-fuchsia-500",
    scale: "border-sky-500",
  }[type];

  const clipBackground = {
    pattern: "bg-pattern-clip/80",
    pose: "bg-pose-clip/80",
    scale: "bg-blue-400/80",
  }[type];

  const clipText = {
    pattern: "text-teal-400",
    pose: "text-fuchsia-400",
    scale: "text-blue-400",
  }[type];

  const props = {
    type,
    types,
    motifBorder,
    motifBackground,
    motifText,
    clipBorder,
    clipBackground,
    clipText,
  };

  return (
    <NavbarGroup
      className={`${background} flex px-4 gap-2 items-center border-x border-x-slate-500/50 transition-all`}
    >
      <NavbarChangeTypeButton {...props} />
      <NavbarCreateMotifButton {...props} />
      <NavbarMotifListbox {...props} />
      <NavbarEditMotifButton {...props} />
      <NavbarArrangeClipButton {...props} />
      <NavbarTypeInfoButton {...props} />
    </NavbarGroup>
  );
}

export interface NavbarToolkitProps {
  type: ClipType;
  types: string;
  motifBorder: string;
  motifBackground: string;
  motifText: string;
  clipBorder: string;
  clipBackground: string;
  clipText: string;
}

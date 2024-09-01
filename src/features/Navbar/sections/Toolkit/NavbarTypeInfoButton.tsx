import classNames from "classnames";
import { NavbarHoverTooltip } from "features/Navbar/components";
import { GiBookCover } from "react-icons/gi";
import { NavbarToolkitProps } from "../NavbarToolkitSection";

export const NavbarTypeInfoButton = ({
  type,
  types,
  motifBorder,
  motifText,
  clipText,
}: NavbarToolkitProps) => {
  const caption = {
    pattern: [
      "A Pattern is a sequence of notes, chords, and rests that can be played by a Pattern Track when scheduled as a Pattern Clip in the timeline.",
      "A Pattern can be bound to a specific Pattern Track, allowing the Pattern to inherit all of the scales of the Pattern Track's ancestral Scale Tracks.",
      "A Pattern Note can then be defined as a degree of any matching scale, allowing for transposition through the use of Poses and Pose Clips.",
    ],
    pose: [
      "A Pose (short for Transposition) is a vector or a sequence of vectors that can temporarily or indefinitely shift the notes of a musical object.",
      "A Pose Vector has an offset for every Scale Track, transposing all notes related to the scale, as well as a chromatic offset and a chordal (inversion) offset.",
      "A Pose Clip can be placed in a Pattern Track to transpose its Pattern Clips or placed in a Scale Track to transpose its (and its descendants') scales.",
    ],
    scale: [
      "A Scale is a structured collection of notes that can organize music and define a pattern of intervals for transposition (i.e. how many steps to move).",
      "Scales can be defined using scale degrees of other Scales, and all Scale Tracks are defined in relation to their parent or the chromatic scale by default.",
      "A Scale Clip can be placed in any kind of track to temporarily or indefinitely replace its current scale, assuming that the cardinalities are equivalent.",
    ],
  }[type];

  const Button = () => (
    <div
      className={classNames(
        "cursor-help flex total-center size-8 xl:size-9",
        `bg-transparent hover:bg-slate-400/20 hover:text-white`,
        `border ${motifBorder} rounded-full transition-all`
      )}
    >
      <GiBookCover />
    </div>
  );

  const Tooltip = () => (
    <NavbarHoverTooltip
      className="w-[300px] -left-18"
      borderColor={motifBorder}
    >
      <p className="text-sm capitalize font-light border-b border-b-slate-500/50 pb-2 mb-1 transition-all">
        <span className={motifText}>{types}</span> and{" "}
        <span className={clipText}>{type} Clips</span> Explained
      </p>
      <div className="flex flex-col py-1 gap-2 text-xs text-slate-300 font-light">
        {caption.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </div>
    </NavbarHoverTooltip>
  );

  return (
    <div
      className="flex group relative font-light space-x-2 text-lg items-center"
      id="clip-type-button"
    >
      {Button()}
      {Tooltip()}
    </div>
  );
};

import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import {
  Gi3DStairs,
  GiFamilyTree,
  GiPianoKeys,
  GiWireframeGlobe,
} from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import {
  createNewTracks,
  createTracksFromString,
} from "types/Track/TrackUtils";
import { cancelEvent } from "utils/html";

export const NavbarTrackIcon = GiWireframeGlobe;
export const navbarTrackBackground =
  "bg-gradient-radial from-indigo-700/70 to-indigo-500/70";

export const NavbarTrackButton = () => {
  const dispatch = useProjectDispatch();
  return (
    <div className="relative group/tooltip">
      <NavbarTooltipButton
        disabledClass="cursor-pointer select-none"
        className={classNames(
          navbarTrackBackground,
          "border border-indigo-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
        )}
        borderColor="border-indigo-400"
        onClick={() => dispatch(createNewTracks)}
      >
        <NavbarTrackIcon />
      </NavbarTooltipButton>
      <NavbarHoverTooltip
        top="top-8"
        borderColor="border-indigo-500"
        bgColor="bg-zinc-900"
        className={`-left-36 min-w-[24rem] whitespace-nowrap transition-all`}
        padding="py-2 px-3"
      >
        <div className="text-wrap flex flex-col pb-2 [&>div>div>ul>li>span]:text-slate-400">
          <div className="text-xl font-light">Create New Tracks (N)</div>
          <div className="text-base mb-1 text-indigo-400/80">
            Design a Musical Structure
          </div>
          <input
            placeholder="Enter Request In TreeJS"
            className="bg-transparent my-2 rounded w-full placeholder:text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                cancelEvent(e);
                dispatch(createTracksFromString(e.currentTarget.value));
                e.currentTarget.value = "";
                e.currentTarget.blur();
              }
            }}
          />
          <div className="text-slate-500 mb-4">
            {`Example: "C major => Cmaj7 => (piano + bass)"`}
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-2 border rounded-sm border-sky-500/50">
              <Gi3DStairs className="inline text-xl mr-1" /> TreeJS: How to
              Create Scale Tracks
              <ul className="list-disc pl-4">
                <li>
                  By name <span>('C major chord' or 'Cmaj7')</span>
                </li>
                <li>
                  By note <span>('C, D, E, F, G, A, B')</span>
                </li>
                <li>
                  By degree <span>('0, 2, 4, 5, 7, 9, 11')</span>
                </li>
              </ul>
            </div>
            <div className="p-2 border rounded-sm border-emerald-500/50">
              <GiPianoKeys className="inline text-xl mr-1" /> TreeJS: How to
              Create Pattern Tracks
              <ul className="list-disc pl-4">
                <li>
                  By instrument <span>('piano' or 'bass')</span>
                </li>
                <li>
                  By category <span>('keyboards' or 'strings')</span>
                </li>
                <li>
                  By file <span>('sample' will ask for a file)</span>
                </li>
              </ul>
            </div>
            <div className="p-2 border rounded-sm border-fuchsia-500/50">
              <GiFamilyTree className="inline rotate-180 text-xl mr-1" />{" "}
              TreeJS: How to Create Track Families
              <ul className="list-disc pl-4">
                <li>
                  By nesting{" "}
                  <span>(A {"=>"} B will make B the child of A)</span>
                </li>
                <li>
                  By adding <span>(A + B will make B the sibling of A)</span>
                </li>
                <li>
                  By grouping{" "}
                  <span>
                    ((A {"=>"} B) + C is not A + (B {"=>"} C))
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </NavbarHoverTooltip>
    </div>
  );
};

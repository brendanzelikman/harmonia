import { NavbarGroup } from "./components/NavbarGroup";
import { NavbarFileMenu } from "./sections/Project/NavbarFileMenu";
import { NavbarLivePlayButton } from "./sections/Toolkit/NavbarLivePlayButton";
import { NavbarSettingsMenu } from "./sections/Project/NavbarSettingsMenu";
import { NavbarPortalGun } from "./sections/Toolkit/NavbarPortalGun";
import { NavbarScissors } from "./sections/Toolkit/NavbarScissors";
import { NavbarTime } from "./sections/Transport/NavbarTime";
import { NavbarTransportControl } from "./sections/Transport/NavbarTransportControl";
import { NavbarVolume } from "./sections/Transport/NavbarVolume";
import { NavbarRedo, NavbarUndo } from "./sections/Project/NavbarUndoRedo";
import { NavbarTrackButton } from "./sections/Toolkit/NavbarTrackButton";
import { use, useProjectDispatch } from "types/hooks";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { NavbarMergeClipsButton } from "./sections/Toolkit/NavbarMergeButton";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  GiDominoMask,
  GiDramaMasks,
  GiMusicalNotes,
  GiMusicSpell,
} from "react-icons/gi";
import { toggleAddingState } from "types/Timeline/TimelineThunks";
import {
  selectTimelineState,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import { NavbarClipButton } from "./sections/Toolkit/NavbarClipButton";

export function NavbarPlaygroundContent() {
  const dispatch = useProjectDispatch();
  const hasTracks = use(selectHasTracks);
  const state = use(selectTimelineState);
  const type = use(selectTimelineType);
  const addingScales = state === "adding-clips" && type === "scale";
  const addingPatterns = state === "adding-clips" && type === "pattern";
  const addingPoses = state === "adding-clips" && type === "pose";
  return (
    <div className="size-full flex text-slate-50 *:border-r first:border-r-0 last:border-r-0 *:border-r-slate-500/50">
      <NavbarGroup>
        <NavbarFileMenu />
        <NavbarSettingsMenu />
        <NavbarUndo />
        <NavbarRedo />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-950/30 border-l border-l-slate-500/50">
        <NavbarVolume />
        <NavbarTime />
        <NavbarTransportControl />
      </NavbarGroup>
      <NavbarGroup className="bg-slate-500/10 border-r border-r-slate-500/50">
        <div className="text-sm">Compose:</div>
        <NavbarTrackButton />
        <NavbarClipButton />
        <NavbarLivePlayButton />
      </NavbarGroup>
      {/* <NavbarClipButton /> */}
      <NavbarGroup
        hide={!hasTracks}
        className="bg-slate-500/10 border-r border-r-slate-500/50"
      >
        <div className="text-sm">Arrange:</div>
        <NavbarTooltipButton
          keepTooltipOnClick
          className={classNames(
            addingScales
              ? "ring-2 ring-offset-2 ring-offset-black ring-sky-400"
              : "",
            "size-9 bg-gradient-radial from-sky-500 to-sky-800 transition-all animate-in fade-in"
          )}
          label={`${
            addingScales ? "Creating Scale Clip" : "Create Scale Clip"
          }`}
          onClick={() => dispatch(toggleAddingState({ data: "scale" }))}
        >
          <GiDominoMask />
        </NavbarTooltipButton>
        <NavbarTooltipButton
          keepTooltipOnClick
          className={classNames(
            addingPatterns
              ? "ring-2 ring-offset-2 ring-offset-black ring-emerald-400"
              : "",
            "size-9 bg-gradient-radial from-emerald-500 to-emerald-800"
          )}
          label={`${
            addingPatterns ? "Creating Pattern Clip" : "Create Pattern Clip"
          }`}
          onClick={() => dispatch(toggleAddingState({ data: "pattern" }))}
        >
          <GiMusicalNotes />
        </NavbarTooltipButton>
        <NavbarTooltipButton
          keepTooltipOnClick
          className={classNames(
            addingPoses
              ? "ring-2 ring-offset-2 ring-offset-black ring-fuchsia-400"
              : "",
            "size-9 bg-gradient-radial from-fuchsia-500 to-fuchsia-800"
          )}
          label={`${addingPoses ? "Creating Pose Clip" : "Create Pose Clip"}`}
          onClick={() => dispatch(toggleAddingState({ data: "pose" }))}
        >
          <GiDramaMasks />
        </NavbarTooltipButton>
      </NavbarGroup>
      <NavbarGroup
        hide={!hasTracks}
        className="bg-gradient-radial from-slate-500/30 to-slate-500/5"
      >
        <div className="text-sm">Change:</div>
        <NavbarPortalGun />
        <NavbarScissors />
        <NavbarMergeClipsButton />
      </NavbarGroup>
    </div>
  );
}

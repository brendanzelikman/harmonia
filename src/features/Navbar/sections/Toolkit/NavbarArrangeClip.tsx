import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  ARRANGE_PATTERNS_HOTKEY,
  ARRANGE_POSES_HOTKEY,
} from "pages/Playground/hotkeys/useTimelineHotkeys";
import { GiMove, GiMusicalNotes } from "react-icons/gi";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { ClipType } from "types/Clip/ClipTypes";
import { useStore, useDispatch } from "types/hooks";
import {
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  DEFAULT_TRACK_PROMPT,
  toggleAddingState,
} from "types/Timeline/TimelineThunks";
import { createTreeFromString } from "utils/tree";

export const NavbarArrangeClip = (props: { type: ClipType }) => {
  const dispatch = useDispatch();
  const type = useStore(selectTimelineType);
  const isAdding = useStore(selectIsAddingClips);
  const active = isAdding && type === props.type;
  const hotkey = dispatch(hotkeys[props.type]);
  const hasTracks = useStore(selectHasTracks);
  const icon = icons[props.type];
  const background = backgrounds[props.type];
  const borderColor = borders[props.type];
  const textColor = textColors[props.type];

  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "size-9 bg-gradient-radial",
        active ? "ring-2 ring-offset-2 ring-offset-black" : "",
        background
      )}
      borderColor={borderColor}
      label={
        hasTracks ? undefined : (
          <span className={textColor}>Create Tree to Create {props.type}</span>
        )
      }
      hotkey={hotkey}
      onClick={() =>
        !hasTracks
          ? dispatch(createTreeFromString({ data: DEFAULT_TRACK_PROMPT }))
          : dispatch(toggleAddingState({ data: props.type }))
      }
    >
      {icon}
    </NavbarTooltipButton>
  );
};

const hotkeys = {
  pattern: ARRANGE_PATTERNS_HOTKEY,
  pose: ARRANGE_POSES_HOTKEY,
};

const icons = {
  pattern: <GiMusicalNotes className="text-2xl " />,
  pose: <GiMove className="text-2xl" />,
};

const textColors = {
  pattern: "text-teal-400",
  pose: "text-fuchsia-400",
};

const borders = {
  pattern: "border-teal-400",
  pose: "border-fuchsia-400",
};

const backgrounds = {
  pattern: "from-teal-800 to-teal-500 ring-teal-400",
  pose: "from-fuchsia-800 to-fuchsia-600 ring-fuchsia-400",
};

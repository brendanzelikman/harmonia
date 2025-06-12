import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  ArrangePatternIcon,
  ArrangePatternsHotkey,
  ArrangePoseIcon,
  ArrangePosesHotkey,
} from "lib/hotkeys/timeline";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { ClipType } from "types/Clip/ClipTypes";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  DEFAULT_TRACK_PROMPT,
  toggleAddingState,
} from "types/Timeline/TimelineThunks";
import { createTreeFromString } from "lib/prompts/tree";

export const NavbarArrangeClip = (props: { type: ClipType }) => {
  const dispatch = useAppDispatch();
  const type = useAppValue(selectTimelineType);
  const isAdding = useAppValue(selectIsAddingClips);
  const active = isAdding && type === props.type;
  const hotkey = hotkeys[props.type];
  const hasTracks = useAppValue(selectHasTracks);
  const icon = icons[props.type];
  const background = backgrounds[props.type];
  const borderColor = borders[props.type];
  const textColor = textColors[props.type];

  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      disabled={!hasTracks}
      className={classNames(
        "bg-radial border",
        !hasTracks ? "opacity-50" : "",
        active ? "ring-2 ring-offset-2 ring-offset-black" : "",
        background,
        borderColor
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
  pattern: ArrangePatternsHotkey,
  pose: ArrangePosesHotkey,
};

const icons = {
  pattern: <ArrangePatternIcon className="text-2xl " />,
  pose: <ArrangePoseIcon className="text-2xl" />,
};

const textColors = {
  pattern: "text-teal-400",
  pose: "text-fuchsia-400",
};

const borders = {
  pattern: "border-teal-400",
  pose: "border-fuchsia-500",
};

const backgrounds = {
  pattern: "from-teal-900 to-teal-500 ring-teal-400",
  pose: "from-fuchsia-800 to-fuchsia-600 ring-fuchsia-400",
};

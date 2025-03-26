import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  ARRANGE_PATTERN_CLIPS_HOTKEY,
  ARRANGE_POSE_CLIPS_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";
import { GiCrystalWand, GiPaintBrush } from "react-icons/gi";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { ClipType } from "types/Clip/ClipTypes";
import { useDeep, useProjectDispatch } from "types/hooks";
import {
  selectIsAddingClips,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { toggleAddingState } from "types/Timeline/TimelineThunks";

export const NavbarArrangeClip = (props: { type: ClipType }) => {
  const dispatch = useProjectDispatch();
  const type = useDeep(selectTimelineType);
  const isAdding = useDeep(selectIsAddingClips);
  const active = isAdding && type === props.type;
  const hotkey = dispatch(hotkeys[props.type]);
  const hasTracks = useDeep(selectHasTracks);
  const icon = icons[props.type];
  const background = backgrounds[props.type];
  const borderColor = borders[props.type];
  const tool = tools[props.type];
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
          <span className={textColor}>Create Tree to Use {tool}</span>
        )
      }
      hotkey={hotkey}
      onClick={() => dispatch(toggleAddingState({ data: props.type }))}
    >
      {icon}
    </NavbarTooltipButton>
  );
};

const hotkeys = {
  pattern: ARRANGE_PATTERN_CLIPS_HOTKEY,
  pose: ARRANGE_POSE_CLIPS_HOTKEY,
};

const icons = {
  pattern: <GiPaintBrush className="text-2xl " />,
  pose: <GiCrystalWand className="text-2xl" />,
};

const tools = {
  pattern: "Brush",
  pose: "Wand",
};

const textColors = {
  pattern: "text-emerald-400",
  pose: "text-fuchsia-400",
};

const borders = {
  pattern: "border-emerald-400",
  pose: "border-fuchsia-400",
};

const backgrounds = {
  pattern: "from-emerald-800 to-emerald-500 ring-emerald-400",
  pose: "from-fuchsia-800 to-fuchsia-500 ring-fuchsia-400",
};

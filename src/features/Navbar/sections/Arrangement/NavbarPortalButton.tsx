import { NavbarTooltip, NavbarTooltipButton } from "../../components";
import { useDeep, useProjectDispatch, useProjectSelector } from "types/hooks";
import { GiPortal } from "react-icons/gi";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { hasKeys } from "utils/objects";
import { isTimelinePortalingClips } from "types/Timeline/TimelineFunctions";
import { selectTimeline } from "types/Timeline/TimelineSelectors";
import { selectClipIds } from "types/Clip/ClipSelectors";
import { togglePortalingMedia } from "types/Timeline/TimelineThunks";

export const NavbarPortalButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const hasClips = useDeep(selectClipIds).length > 0;
  const isPortaling = isTimelinePortalingClips(timeline);
  const fragment = timeline.mediaDraft?.portal;
  const isFragment = hasKeys(fragment);

  const PortalButton = () => {
    const buttonClass = classNames(
      "delay-0 border-slate-400/50",
      hasClips ? "cursor-pointer" : "opacity-50",
      {
        "bg-gradient-to-tr from-sky-600 to-orange-600": !isPortaling,
        "ring-2 ring-offset-2 ring-offset-black duration-150": isPortaling,
        "bg-sky-600 ring-sky-600/80": isPortaling && !isFragment,
        "bg-orange-500 ring-orange-400/80": isPortaling && isFragment,
      }
    );
    return (
      <NavbarTooltipButton
        label={isPortaling ? "Stop Creating a Portal" : "Create a Portal"}
        disabled={!hasClips}
        className={buttonClass}
        onClick={() => dispatch(togglePortalingMedia())}
      >
        <GiPortal />
      </NavbarTooltipButton>
    );
  };

  const [content, setContent] = useState("Place an Entry Portal");
  useEffect(() => {
    if (isPortaling && isFragment) setContent("Place an Exit Portal");
    if (isPortaling && !isFragment) setContent("Place an Entry Portal");
  });

  const PortalTooltip = () => {
    const tooltipClass = classNames(
      "left-[-3.2rem] px-2 backdrop-blur",
      { "bg-sky-600/80": isPortaling && !isFragment },
      { "bg-orange-500/80": isPortaling && isFragment }
    );
    return (
      <NavbarTooltip
        content={content}
        className={tooltipClass}
        show={!!isPortaling}
      />
    );
  };

  return (
    <div className="relative">
      {PortalButton()}
      {PortalTooltip()}
    </div>
  );
};

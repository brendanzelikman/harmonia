import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { isTimelinePortalingClips } from "types/Timeline";
import { togglePortalingMedia } from "redux/thunks";
import { GiPortal } from "react-icons/gi";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { hasKeys } from "utils/objects";
import { updateMediaDraft } from "redux/Timeline";

export const NavbarPortalButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isPortaling = isTimelinePortalingClips(timeline);
  const fragment = timeline.mediaDraft.portal;
  const isFragment = hasKeys(fragment);

  // Remove the fragment when the user stops portaling
  useEffect(() => {
    if (!isPortaling && isFragment) {
      dispatch(updateMediaDraft({ portal: {} }));
    }
  }, [isPortaling, isFragment]);

  const PortalButton = () => {
    const buttonClass = classNames("delay-0 border-slate-400/50", {
      "bg-gradient-to-tr from-sky-600 to-orange-600": !isPortaling,
      "ring-2 ring-offset-2 ring-offset-black duration-150": isPortaling,
      "bg-sky-600 ring-sky-600/80": isPortaling && !isFragment,
      "bg-orange-500 ring-orange-400/80": isPortaling && isFragment,
    });
    return (
      <NavbarTooltipButton
        label={
          isPortaling ? "Stop Portaling Track Media" : "Portal Track Media"
        }
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

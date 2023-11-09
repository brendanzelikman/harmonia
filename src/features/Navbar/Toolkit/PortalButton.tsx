import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { NavbarTooltip } from "../components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectTimeline } from "redux/selectors";
import { isTimelinePortalingMedia } from "types/Timeline";
import { togglePortalingMedia } from "redux/thunks";
import { GiPortal } from "react-icons/gi";
import { useEffect } from "react";
import classNames from "classnames";
import { hasKeys } from "utils/objects";
import { updateMediaDraft } from "redux/Timeline";

export const ToolkitPortalButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isPortaling = isTimelinePortalingMedia(timeline);
  const fragment = timeline.mediaDraft.portal;
  const isFragment = hasKeys(fragment);

  // Remove the fragment when the user stops portaling
  useEffect(() => {
    if (!isPortaling && isFragment) {
      dispatch(updateMediaDraft({ portal: {} }));
    }
  }, [isPortaling, isFragment]);

  const PortalButton = () => {
    const buttonClass = classNames({
      "bg-sky-600": !isPortaling && !isFragment,
      "ring-2 ring-offset-2 ring-offset-black": isPortaling,
      "bg-sky-600 ring-sky-600/80": isPortaling && !isFragment,
      "bg-orange-400 ring-orange-400/80": isPortaling && isFragment,
    });
    return (
      <NavbarToolkitButton
        label="Portal Track Media"
        className={buttonClass}
        onClick={() => dispatch(togglePortalingMedia())}
      >
        <GiPortal />
      </NavbarToolkitButton>
    );
  };

  const PortalTooltip = () => {
    const tooltipClass = classNames(
      "left-[-3.2rem] duration-150 px-2 backdrop-blur",
      { "bg-sky-600": isPortaling && !isFragment },
      { "bg-orange-400": isPortaling && isFragment }
    );
    return (
      <NavbarTooltip
        content="Portaling Track Media"
        className={tooltipClass}
        show={!!isPortaling}
      />
    );
  };

  return (
    <div className="relative">
      <PortalButton />
      {PortalTooltip()}
    </div>
  );
};

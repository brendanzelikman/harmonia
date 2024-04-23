import ReactConfetti from "react-confetti";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BsQuestionCircleFill } from "react-icons/bs";
import { ShepherdTourContext } from "react-shepherd";
import { hideEditor } from "redux/Editor";
import { useProjectDispatch } from "redux/hooks";
import { dispatchCustomEvent } from "utils/html";
import { NavbarTooltipButton } from "features/Navbar/components";
import { END_TOUR, START_TOUR } from "./useOnboardingTour";
import { useCustomEventListener } from "hooks";
import classNames from "classnames";

export const TourButton = () => {
  const dispatch = useProjectDispatch();
  const tour = useContext(ShepherdTourContext);
  const isActive = !!tour?.isActive();
  const [isStarted, setIsStarted] = useState(false);
  const cancelTour = () => tour?.cancel();

  const [confetti, setConfetti] = useState(false);
  useCustomEventListener("confetti", (e) => setConfetti(e.detail));

  const callback = () => {
    dispatchCustomEvent("confetti", false);
    setIsStarted(false);
    const event = new CustomEvent(END_TOUR);
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (tour) {
      tour.on("start", () => setIsStarted(true));
      tour.on("complete", callback);
      tour.on("cancel", callback);
    }
    return () => {
      if (isActive && !isStarted) {
        cancelTour();
      }
    };
  }, [tour, isActive, isStarted]);

  useEffect(() => {
    return cancelTour;
  }, []);

  useOverridingHotkeys("escape", () => isStarted && callback(), [isStarted]);

  if (!tour) return null;

  const onClick = () => {
    if (isActive || isStarted) {
      tour.cancel();
      dispatchCustomEvent(END_TOUR);
      setIsStarted(false);
      dispatchCustomEvent("confetti", false);
    } else {
      tour.start();
      dispatchCustomEvent(START_TOUR);
      dispatch(hideEditor());
    }
  };

  return (
    <>
      <NavbarTooltipButton
        className={classNames(
          `border-0 focus:outline-none`,
          isActive ? "text-sky-600" : "text-slate-50"
        )}
        label={
          isActive ? "End the Onboarding Tour" : "Start the Onboarding Tour"
        }
        onClick={onClick}
      >
        <BsQuestionCircleFill
          className={classNames({
            "rounded-full ring-2 ring-sky-600 ring-offset-4 ring-offset-gray-900":
              isActive,
          })}
        />
      </NavbarTooltipButton>
      {!!confetti &&
        createPortal(<ReactConfetti className="z-[90]" />, document.body)}
    </>
  );
};

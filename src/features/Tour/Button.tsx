import ReactConfetti from "react-confetti";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BsQuestionCircleFill } from "react-icons/bs";
import { ShepherdTourContext } from "react-shepherd";
import { hideEditor } from "redux/Editor";
import { useProjectDispatch } from "redux/hooks";
import { END_TOUR, START_TOUR } from ".";
import { dispatchCustomEvent } from "utils/html";
import { NavbarButton } from "features/Navbar/components";

interface ContentProps {
  confetti: boolean;
  setConfetti: (confetti: boolean) => void;
}

export const ShepherdTourButton = (props: ContentProps) => {
  const dispatch = useProjectDispatch();
  const tour = useContext(ShepherdTourContext);
  const isActive = !!tour?.isActive();
  const [isStarted, setIsStarted] = useState(false);
  const cancelTour = () => tour?.cancel();

  const callback = () => {
    props.setConfetti(false);
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
      props.setConfetti(false);
    } else {
      tour.start();
      dispatchCustomEvent(START_TOUR);
      dispatch(hideEditor());
    }
  };

  const color = isActive ? "text-sky-600" : "text-slate-50";
  const buttonClass = isActive
    ? "rounded-full ring-2 ring-sky-600 ring-offset-4 ring-offset-gray-900"
    : "";

  return (
    <>
      <NavbarButton className={`focus:outline-none ${color}`} onClick={onClick}>
        <BsQuestionCircleFill className={buttonClass} />
      </NavbarButton>
      {props.confetti &&
        createPortal(<ReactConfetti className="z-[80]" />, document.body)}
    </>
  );
};

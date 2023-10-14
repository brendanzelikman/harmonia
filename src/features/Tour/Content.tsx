import ReactConfetti from "react-confetti";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BsQuestionCircleFill } from "react-icons/bs";
import { ShepherdTourContext } from "react-shepherd";
import { hideEditor } from "redux/Editor";
import { endTour, selectRootTour, startTour } from "redux/Root";
import { useAppDispatch, useAppSelector } from "redux/hooks";

interface ContentProps {
  confetti: boolean;
  setConfetti: (confetti: boolean) => void;
}

export const ShepherdTourContent = (props: ContentProps) => {
  const dispatch = useAppDispatch();
  const { show } = useAppSelector(selectRootTour);
  const tour = useContext(ShepherdTourContext);
  const isActive = !!tour?.isActive();
  const [isStarted, setIsStarted] = useState(false);

  const cancelTour = () => tour?.cancel();

  const callback = () => {
    props.setConfetti(false);
    dispatch(endTour());
    setIsStarted(false);
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
      props.setConfetti(false);
      tour.cancel();
      setIsStarted(false);
      dispatch(endTour());
    } else {
      dispatch(hideEditor());
      tour.start();
      dispatch(startTour());
    }
  };

  const color = show ? "text-sky-600" : "text-slate-50";
  const buttonClass = show
    ? "rounded-full ring-2 ring-sky-600 ring-offset-4 ring-offset-gray-900"
    : "";

  return (
    <>
      <button className={`ml-2 focus:outline-none ${color}`} onClick={onClick}>
        <BsQuestionCircleFill className={`text-2xl ${buttonClass}`} />
      </button>
      {props.confetti &&
        createPortal(<ReactConfetti className="z-[80]" />, document.body)}
    </>
  );
};

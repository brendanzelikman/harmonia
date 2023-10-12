import * as Root from "redux/Root";
import ReactConfetti from "react-confetti";
import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BsQuestionCircleFill } from "react-icons/bs";
import { Step, ShepherdTour, ShepherdTourContext, Tour } from "react-shepherd";
import { hideEditor, showEditor } from "redux/Editor";
import { setTimelineState } from "redux/Timeline";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";

export default function OnboardingTour() {
  const dispatch = useAppDispatch();
  const [confetti, setConfetti] = useState(false);

  const defaultClass =
    "bg-slate-800/75 backdrop-blur text-slate-300 p-8 rounded-md text-sm font-nunito border-4 border-slate-900 ring-8 ring-sky-500/80 drop-shadow-2xl focus:outline-none z-90";
  const defaultButtons: Step.StepOptionsButton[] = [
    {
      text: "Next",
      classes:
        "bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700",
      action() {
        this.next();
        dispatch(Root.nextTourStep());
      },
    },
    {
      text: "Skip",
      classes: "bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700",
      action() {
        this.cancel();
        dispatch(Root.endTour());
      },
    },
  ];
  const steps: Step.StepOptions[] = [
    {
      text: [
        `
    <div class="flex">
      <p class="flex flex-col w-72">
        <span class="text-sky-500/80 text-lg font-semibold mb-3">Welcome to Harmonia!</span>
        <span class="text-slate-300 text-3xl font-bold mb-2">Ready for a Tour?</span>
        <span class="text-slate-400">We'll teach you the basics in no time, but feel free to explore at your own pace.</span>
      <p>
      <img src="logo.png" class="flex-shrink-0 w-36 h-36 ml-4" />
    </div>
    `,
      ],
      classes: defaultClass,
      buttons: [
        {
          text: "Yes please!",
          classes:
            "border border-slate-600/50 bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700 hover:border-slate-600/75",
          action() {
            this.next();
            dispatch(Root.nextTourStep());
            dispatch(hideEditor());
          },
        },
        {
          text: "Maybe later...",
          classes:
            "border border-slate-600/50 bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700 hover:border-slate-600/75",
          action() {
            this.cancel();
            dispatch(Root.endTour());
          },
        },
      ],
    },
    {
      text: tourText({
        title: "What is Harmonia?",
        text: "Harmonia is a pattern-based digital audio workstation (DAW) with an integrated harmonic scaffolding for quick and intuitive composition!",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Tracks in Harmonia",
        text: "On your left, you can see that there are two kinds of tracks: the Scale Track (colored in blue) and the Pattern Track (colored in green).",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "The Scale Track",
        text: "The Scale Track defines the scale of the patterns played by its Pattern Tracks, and you can change this scale by clicking on the Track Scale button.",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "The Pattern Track",
        text: "The Pattern Track contains an instrument to play any patterns you compose, and can change this instrument by clicking on the Track Instrument button.",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "The Toolbar",
        text: "On the top of your screen, you can see the Toolbar, which contains all of the essential tools you'll need for composing your patterns.",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Opening the Pattern Editor",
        text: "To start composing a pattern, click on the Pencil icon next to the Selected Pattern in the Toolbar to open the Pattern Editor.",
      }),
      advanceOn: {
        selector: "#pattern-button",
        event: "click",
      },
      classes: defaultClass,
    },
    {
      text: tourText({
        title: "The Pattern Editor",
        text: "Welcome to the Pattern Editor, where you can view and edit all of your patterns. We've given you a handful to get started with, but you can always create your own!",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "The Pattern Editor",
        text: "We're gonna skip over all of the controls for now, but feel free to explore them after the tour! There's a lot to see for yourself!",
      }),
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Adding Pattern Clips",
        text: "You can arrange a Pattern by clicking on the Brush Icon in the Toolbar and selecting a beat within a Pattern Track on the Timeline.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(hideEditor());
          dispatch(setTimelineState("adding"));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Cutting Pattern Clips",
        text: "You can cut a Pattern into two by clicking on the Scissors Icon in the Toolbar and selecting a beat within a Pattern Clip on the Timeline.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("cutting"));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Merging Pattern Clips",
        text: "You can merge one or more Patterns together by clicking on the Chain Icon in the Toolbar and following the dropdown menu.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("merging"));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Repeating Pattern Clips",
        text: "You can repeat one or more Patterns by clicking on the Clock Icon in the Toolbar and following the dropdown menu.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("repeating"));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Transposing Tracks and Clips",
        text: "You can add a Transposition to the Timeline by clicking on the Wand Icon in the Toolbar and selecting a beat or clip on the Timeline.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("transposing"));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Saving Your Work",
        text: "Lastly, and most importantly, you can save your project by clicking on the File Icon in the Toolbar and following the dropdown menu.",
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("idle"));
          dispatch(showEditor({ id: "file" }));
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Questions or Concerns?",
        body: `<span class="text-slate-300 text-lg mb-4">
            If you have any questions or concerns about Harmonia, please go check out our 
            <a
              href="https://www.github.com/brendanzelikman/harmonia"
              target="_blank"
              rel="noreferrer"
              class="text-blue-600"
            >
              GitHub repository
            </a>
             for more information!
          </span>`,
      }),
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          dispatch(setTimelineState("idle"));
          dispatch(hideEditor());
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Congratulations!",
        text: "That's all you need to know! We hope you enjoy using Harmonia!",
      }),
      classes: defaultClass,
      buttons: [
        {
          text: "Hooray!",
          classes:
            "bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 mt-5 hover:bg-sky-700 w-full",
          action() {
            window.location.reload();
          },
        },
      ],
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          setConfetti(true);
          resolve();
        });
      },
    },
    { text: "<div></div>" },
  ];

  const tourOptions: Tour.TourOptions = { useModalOverlay: true };
  return (
    <ShepherdTour steps={steps} tourOptions={tourOptions}>
      <ShepherdTourContent confetti={confetti} setConfetti={setConfetti} />
    </ShepherdTour>
  );
}

interface ContentProps {
  confetti: boolean;
  setConfetti: (confetti: boolean) => void;
}

function ShepherdTourContent(props: ContentProps) {
  const dispatch = useAppDispatch();
  const root = useAppSelector(Root.selectRoot);
  const tour = useContext(ShepherdTourContext);
  const isActive = !!tour?.isActive();
  const [isStarted, setIsStarted] = useState(false);

  const cancelTour = () => tour?.cancel();

  const callback = (finish = true) => {
    if (finish) props.setConfetti(false);
    dispatch(Root.endTour());
    setIsStarted(false);
  };

  useEffect(() => {
    if (tour) {
      tour.on("start", () => setIsStarted(true));
      tour.on("complete", () => callback(false));
      tour.on("cancel", () => callback(true));
    }
    return () => {
      cancelTour();
    };
  }, [tour]);

  useOverridingHotkeys(
    "escape",
    () => {
      if (isActive) {
        callback(true);
        dispatch(Root.endTour());
      }
    },
    [isActive]
  );

  if (!tour) return null;

  const onClick = () => {
    if (tour.isActive() || isStarted) {
      setIsStarted(false);
      tour.cancel();
      dispatch(Root.endTour());
      props.setConfetti(false);
    } else {
      dispatch(hideEditor());
      tour.start();
      dispatch(Root.startTour());
    }
  };

  const color = root.showingTour ? "text-sky-600" : "text-slate-50";
  const buttonClass = root.showingTour
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
}

/**
 * Generates the HTML for a tour step based on the given props.
 */
const tourText = (props: { title: string; text?: string; body?: any }) =>
  `
<div class="flex">
  <p class="flex flex-col">
    <span class="font-bold text-2xl mb-2">
      <img src="logo.png" class="w-12 h-12 inline-block" />
      ${props.title}
    </span>
    ${
      props.body
        ? props.body
        : `<span class="text-lg mb-4 text-slate-300/80 font-light">${props.text}</span>`
    }
  </p>
</div>
`;

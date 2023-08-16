import { useContext, useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { createPortal } from "react-dom";
import { BsQuestionCircle } from "react-icons/bs";
import { ConnectedProps, connect } from "react-redux";
import { Step, ShepherdTour, ShepherdTourContext } from "react-shepherd";
import { selectRoot } from "redux/selectors";
import {
  hideEditor,
  setTimelineState,
  toggleTransposingClip,
  showEditor,
} from "redux/slices/root";
import * as Tour from "redux/slices/tour";
import { AppDispatch, RootState } from "redux/store";

const mapStateToProps = (state: RootState) => {
  const { editorState } = selectRoot(state);
  return {
    onEditor: editorState !== "hidden",
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    hideEditor: () => dispatch(hideEditor()),
    setEditorState: (id: any) => dispatch(showEditor({ id })),
    setTimelineState: (state: any) => dispatch(setTimelineState(state)),
    nextTourStep: () => dispatch(Tour.nextTourStep()),
    prevTourStep: () => dispatch(Tour.prevTourStep()),
    startTour: () => dispatch(Tour.startTour()),
    endTour: () => dispatch(Tour.endTour()),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(OnboardingTour);

const tourText = (props: { title: string; text?: string; body?: any }) =>
  `
<div class="flex">
  <p class="flex flex-col">
    <span class="font-bold text-2xl mb-2 text-black">
      <img src="/logo.png" class="w-12 h-12 inline-block" />
      ${props.title}
    </span>
    ${
      props.body
        ? props.body
        : `<span class="text-slate-700 text-lg mb-4">${props.text}</span>`
    }
  </p>
</div>
`;

function OnboardingTour(props: Props) {
  const [finished, setFinished] = useState(false);

  const defaultClass =
    "bg-slate-300/80 backdrop-blur text-slate-300 p-8 rounded-md text-sm font-nunito border-4 border-slate-800 ring-8 ring-sky-500 shadow-xl focus:outline-none z-90";
  const defaultButtons: Step.StepOptionsButton[] = [
    {
      text: "Next",
      classes:
        "bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700",
      action() {
        this.next();
        props.nextTourStep();
      },
    },
    {
      text: "Skip",
      classes: "bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700",
      action() {
        this.cancel();
        props.endTour();
      },
    },
  ];
  const steps: Step.StepOptions[] = [
    {
      text: [
        `
    <div class="flex">
      <p class="flex flex-col w-72">
        <span class="text-blue-700 font-semibold mb-1">Welcome to Harmonia!</span>
        <span class="text-black text-2xl font-bold">Let's get started with a quick website tour!</span>
        <span class="text-slate-500">We'll teach you the basics in no time.</span>
      <p>
      <img src="/logo.png" class="flex-shrink-0 w-36 h-36 ml-4" />
    </div>
    `,
      ],
      classes: defaultClass,
      buttons: [
        {
          text: "Start the tour",
          classes:
            "bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700",
          action() {
            this.next();
            props.nextTourStep();
            if (props.onEditor) {
              props.hideEditor();
            }
          },
        },
        {
          text: "Show me later",
          classes:
            "bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700",
          action() {
            this.cancel();
            props.endTour();
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
          props.hideEditor();
          props.setTimelineState("adding");
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
          props.setTimelineState("cutting");
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
          props.setTimelineState("merging");
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
          props.setTimelineState("repeating");
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
          props.setTimelineState("transposing");
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
          props.setTimelineState("idle");
          props.setEditorState("file");
          resolve();
        });
      },
      classes: defaultClass,
      buttons: defaultButtons,
    },
    {
      text: tourText({
        title: "Questions or Concerns?",
        body: `<span class="text-slate-700 text-lg mb-4">
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
          props.setTimelineState("idle");
          props.setEditorState("hidden");
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
            this.cancel();
            props.endTour();
            setFinished(false);
          },
        },
      ],
      beforeShowPromise() {
        return new Promise<void>((resolve) => {
          setFinished(true);
          resolve();
        });
      },
    },
  ];

  const tourOptions = {
    defualtStepOptions: {
      cancelIcon: {
        enabled: true,
      },
    },
    useModalOverlay: true,
  };
  return (
    <ShepherdTour steps={steps} tourOptions={tourOptions}>
      <ShepherdTourContent
        {...props}
        finished={finished}
        setFinished={setFinished}
      />
    </ShepherdTour>
  );
}

interface ContentProps extends Props {
  finished: boolean;
  setFinished: (finished: boolean) => void;
}

function ShepherdTourContent(props: ContentProps) {
  const tour = useContext(ShepherdTourContext);
  const { onEditor, hideEditor } = props;
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const callback = () => {
      props.setFinished(false);
      props.endTour();
      setIsActive(false);
    };
    if (tour) {
      tour.on("start", () => setIsActive(true));
      tour.on("complete", callback);
      tour.on("cancel", callback);
    }
  }, [tour, props]);

  if (!tour) return null;

  const onClick = () => {
    if (tour.isActive()) {
      tour.cancel();
      props.endTour();
    } else {
      tour.start();
      props.startTour();
      if (onEditor) hideEditor();
    }
  };

  const color = isActive ? "text-sky-600" : "text-slate-50";

  return (
    <>
      <button className={`ml-2 focus:outline-none ${color}`} onClick={onClick}>
        <BsQuestionCircle className="text-2xl" />
      </button>
      {props.finished && createPortal(<ReactConfetti />, document.body)}
    </>
  );
}

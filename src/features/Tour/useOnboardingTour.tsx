import { useCallback, useMemo, useState } from "react";
import { Step, ShepherdTour, Tour } from "react-shepherd";
import { hideEditor, selectEditor, showEditor } from "redux/Editor";
import {
  selectTimeline,
  setSelectedClipType,
  setTimelineState,
} from "redux/Timeline";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import "lib/react-shepherd.css";
import { EditorView } from "types/Editor";
import {
  SelectedClipType,
  TimelineState,
  isTimelineIdle,
} from "types/Timeline";
import { dispatchCustomEvent } from "utils/html";
import LogoImage from "assets/images/logo.png";
import { TourButton } from "./TourButton";

// Custom events
export const SET_TOUR_ID = "SET_TOUR_ID";
export const START_TOUR = "START_TOUR";
export const END_TOUR = "END_TOUR";

/** The onboarding tour uses the react-shepherd library */
export function useOnboardingTour() {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const timeline = useProjectSelector(selectTimeline);

  const defaultClass =
    "bg-slate-800/75 backdrop-blur text-slate-300 p-8 rounded-md text-sm font-nunito border-4 border-slate-900 ring-8 ring-sky-500/80 shadow-2xl focus:outline-none z-90";
  const defaultButtons: Step.StepOptionsButton[] = [
    {
      text: "Next",
      classes:
        "bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700",
      action() {
        this.next();
      },
    },
    {
      text: "Skip",
      classes: "bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700",
      action() {
        this.cancel();
      },
    },
  ];

  interface CreateTextProps {
    title: string;
    body?: any;
    text?: string;
    list?: string[];
  }
  /* Generates the HTML for a tour step based on the given props. */
  const createText = (props: CreateTextProps) => {
    return `
      <div class="flex">
      <div class="flex flex-col">
        <div class="font-bold text-2xl mb-2">
          <img src="${LogoImage}" class="w-12 h-12 mr-1 inline-block" />
          ${props.title}
        </div>
        ${
          props.body
            ? props.body
            : props.list?.length
            ? `
            <div class="text-lg mb-4 text-slate-300/80 font-light">
              <div class="mb-2">
                ${props.text}
              </div>
              <ul class="flex flex-col pl-4 text-md">${props.list.join("")}</ul>
            </div>`
            : `<div class="text-lg mb-4 text-slate-300/80 font-light">${props.text}</div>`
        }
      </div>
      </div>
      `;
  };

  /** Create a tour button */
  const createButton = (options: Partial<Step.StepOptionsButton>) => {
    const button: Step.StepOptionsButton = {
      ...options,
      text: options.text || "",
      classes: options.classes || defaultButtons[0].classes,
      action: options.action || defaultButtons[0].action,
    };
    return button;
  };

  /** Create a tour step */
  const createStep = (options: Partial<Step.StepOptions>) => {
    const step: Step.StepOptions = {
      ...options,
      text: options.text || "",
      classes: options.classes || defaultClass,
      buttons: options.buttons || defaultButtons,
      when: {
        show: () => dispatchCustomEvent(SET_TOUR_ID, options.id),
      },
    };
    return step;
  };

  /** A memoized promise for ensuring the editor is on a particular state */
  const ensureEditorState = useCallback(
    (id: string, view: EditorView) => {
      return () =>
        new Promise((resolve) => {
          if (!isTimelineIdle(timeline)) dispatch(setTimelineState("idle"));
          if (editor.view === view) return resolve(true);
          dispatch(showEditor(view));
          resolve(true);
        });
    },
    [editor]
  );

  /** A memoized promise for ensuring the timeline is on a particular state */
  const ensureTimelineState = useCallback(
    (id: string, state: TimelineState) => {
      return () =>
        new Promise((resolve) => {
          dispatch(hideEditor());
          dispatch(setTimelineState(state));
          resolve(true);
        });
    },
    []
  );

  /** A memoized promise for ensuring the timeline is on a particular state */
  const ensureClipType = useCallback((id: string, type: SelectedClipType) => {
    return () =>
      new Promise((resolve) => {
        dispatch(setSelectedClipType(type));
        resolve(true);
      });
  }, []);

  // Color Coded Text
  const Scale = `<span class="text-sky-400">Scale</span>`;
  const ScaleEditor = `<span class="text-sky-400">Scale Editor</span>`;
  const ScaleTrack = `<span class="text-indigo-400">Scale Track</span>`;
  const Nest = `<span class="text-indigo-400">Nest</span>`;
  const Pattern = `<span class="text-green-400">Pattern</span>`;
  const PatternEditor = `<span class="text-green-400">Pattern Editor</span>`;
  const PatternTrack = `<span class="text-emerald-400">Pattern Track</span>`;
  const Track = `<span class="text-blue-300">Track</span>`;
  const Instrument = `<span class="text-amber-500">Instrument</span>`;
  const InstrumentEditor = `<span class="text-amber-500">Instrument Editor</span>`;
  const Volume = `<span class="text-green-400">Volume</span>`;
  const Pan = `<span class="text-teal-400">Pan</span>`;
  const Mute = `<span class="text-red-500">Mute</span>`;
  const Solo = `<span class="text-yellow-300">Solo</span>`;
  const Clip = `<span class="text-teal-400">Clip</span>`;
  const Clips = `<span class="text-teal-400">Clips</span>`;
  const Pose = `<span class="text-fuchsia-500">Pose</span>`;
  const Poses = `<span class="text-fuchsia-500">Poses</span>`;
  const PoseEditor = `<span class="text-pose">Pose Editor</span>`;
  const Pencil = `<span class="text-emerald-400">Pencil</span>`;
  const Brush = `<span class="text-teal-400">Brush</span>`;
  const Wand = `<span class="text-fuchsia-500">Wand</span>`;
  const Scissors = `<span class="text-gray-400">Scissors</span>`;
  const Chain = `<span class="text-purple-500">Chain</span>`;

  /** Tour Step: Welcome to Harmonia! */
  const step_welcomeToHarmonia = useMemo(() => {
    const id = "tour-step-welcome-to-harmonia";
    const text = `
    <div class="flex">
      <p class="flex flex-col w-72">
        <span class="text-sky-500/80 text-lg font-semibold mb-3">Welcome to Harmonia!</span>
        <span class="text-slate-300 text-3xl font-bold mb-2">Ready for a Tour?</span>
        <span class="text-slate-400">We'll teach you the basics in no time, but feel free to explore at your own pace.</span>
      <p>
      <img src="${LogoImage}" class="flex-shrink-0 w-36 h-36 ml-4" />
    </div>
    `;
    const yesButton = createButton({
      text: "Yes please!",
      classes:
        "border border-slate-600/50 bg-sky-600 font-bold px-4 py-2 rounded-lg mr-2 hover:bg-sky-700 hover:border-slate-600/75",
      action() {
        this.next();

        dispatch(hideEditor());
      },
    });
    const noButton = createButton({
      text: "Maybe later...",
      classes:
        "border border-slate-600/50 bg-slate-600 p-3 px-4 py-2 rounded-lg mx-2 hover:bg-slate-700 hover:border-slate-600/75",
      action() {
        this.cancel();
      },
    });
    return createStep({ id, text, buttons: [yesButton, noButton] });
  }, []);

  /** Tour Step: What is Harmonia? */
  const step_whatIsHarmonia = useMemo(() => {
    const id = "tour-step-what-is-harmonia";
    const text = createText({
      title: "What is Harmonia?",
      text: "Harmonia is a pattern-based digital audio workstation (DAW) with an integrated harmonic scaffolding for powerfully automated composition!",
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: Tracks in Harmonia */
  const step_trackIntro = useMemo(() => {
    const id = "tour-step-track-intro";
    const text = createText({
      title: "Tracks in Harmonia",
      text: "Instead of treating every track as one unit, Harmonia splits them into two types:",
      list: [
        `<li>• A ${ScaleTrack} has its own scale and can nest other tracks.</li>`,
        `<li>• A ${PatternTrack} has its own instrument and can play audio.</li>`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: The Scale Track */
  const step_theScaleTrack = useMemo(() => {
    const id = "tour-step-the-scale-track";
    const text = createText({
      title: "The Scale Track",
      text: `By default, a ${ScaleTrack} uses the chromatic scale, so making use of different scales is entirely optional.
      All of its descendant tracks will inherit its scale.`,
      list: [
        `<li>• The ${Scale} button opens the ${ScaleEditor}.</li>`,
        `<li>• The <div class="mx-1 text-green-400 border border-green-400 w-6 h-6 text-center inline-flex items-center justify-center rounded-full">+</div> button creates a new ${PatternTrack}.</li>`,
        `<li>• The <div class="mx-1 text-indigo-400 border border-indigo-400 w-6 h-6 text-center inline-flex items-center justify-center rounded-full">+</div> button creates a nested ${ScaleTrack}.</li>`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: The Pattern Track */
  const step_thePatternTrack = useMemo(() => {
    const id = "tour-step-the-pattern-track";
    const text = createText({
      title: "The Pattern Track",
      text: `On the other hand, a ${PatternTrack} inherits the scale of its parent ${ScaleTrack} 
      and can be used to play any patterns you create. Think of these like any other track in a DAW.`,
      list: [
        `<li>• The ${Instrument} button opens the ${InstrumentEditor}.</li>`,
        `<li>• The ${Volume} & ${Pan} sliders adjust the loudness and stereo balance.</li>`,
        `<li>• The ${Mute} & ${Solo} buttons control the output relative to all tracks.</li>`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /* Tour Step: Tutorial Intro */
  const step_tutorialIntro = useMemo(() => {
    const id = "tour-step-tutorial-intro";
    const text = createText({
      title: "Let's Make Music!",
      text: "Now that you know the basics, let's walk through the process of using the website!",
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: The Navbar */
  const step_navbarIntro = useMemo(() => {
    const id = "tour-step-navbar-intro";
    const text = createText({
      title: "The Navbar",
      text: `The Navbar lives on the top of your screen and contains all of the essential tools you'll need for composition. 
      Everything is streamlined to make your experience as easy as possible, so say goodbye to cluttered menus and confusing toolbars!`,
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureClipType(id, "pattern"),
    });
  }, []);

  /** Tour Step: Opening the Pattern Editor */
  const step_patternEditorPrompt = useMemo(() => {
    const id = "tour-step-pattern-editor-prompt";
    const text = createText({
      title: "Opening the Pattern Editor",
      text: `To view and edit your patterns, click on the ${Pencil} to open the ${PatternEditor}.`,
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      beforeShowPromise: ensureEditorState(id, null),
      advanceOn: { selector: "#pattern-editor-button", event: "click" },
    });
  }, [ensureEditorState]);

  /** Tour Step: Pattern Editor Intro */
  const step_patternEditorIntro = useMemo(() => {
    const id = "tour-step-pattern-editor-intro";
    const text = createText({
      title: "The Pattern Editor",
      text: `Welcome to the ${PatternEditor}, where you can view and edit all of your patterns. We've given you a handful to get started with, but you can always create your own!`,
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureEditorState(id, "pattern"),
    });
  }, [ensureEditorState]);

  /** Tour Step: Pattern Editor Conclusion */
  const step_patternEditorConclusion = useMemo(() => {
    const id = "tour-step-pattern-editor-conclusion";
    const text = createText({
      title: "The Pattern Editor",
      text: "We're gonna skip over all of the specific controls for now, but feel free to explore them after the tour! There's a lot to see for yourself!",
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureEditorState(id, "pattern"),
    });
  }, [ensureEditorState]);

  /** Tour Step: Adding Clips */
  const step_addingPatternClips = useMemo(() => {
    const id = "tour-step-adding-pattern-clips";
    const text = createText({
      title: "Adding Patterns as Clips",
      text: `After selecting a ${Pattern}, you can arrange it as a ${Clip} by
      clicking on the ${Brush} and selecting any beat in the grid.`,
      list: [
        `<li>• A ${Clip} can only be arranged within a ${PatternTrack}.</li>`,
        `<li>• A ${Clip} will always display the name of its pattern.</li>`,
        `<li>• You can double click on any ${Clip} to open the ${PatternEditor}.</li>`,
      ],
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureTimelineState(id, "addingPatternClips"),
    });
  }, [ensureTimelineState]);

  /** Tour Step: Switching Clip Types */
  const step_switchingClips = useMemo(() => {
    const id = "tour-step-switching-clips";
    const text = createText({
      title: "Preparing Your Poses",
      text: `To switch between your Patterns and Poses, click on the colored icon to the left of the Pattern Listbox.`,
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      beforeShowPromise: ensureEditorState(id, null),
      advanceOn: { selector: "#clip-type-button", event: "click" },
    });
  }, [ensureEditorState]);

  /** Tour Step: Adding Clips */
  const step_workingWithPoses = useMemo(() => {
    const id = "tour-step-working-with-poses";
    const text = createText({
      title: "Working with Poses",
      text: `Nice work! Just like with your Patterns, you can open the Pose Editor and arrange your Poses as clips using the analogous buttons in the Navbar! Additionally,`,
      list: [
        `<li>• A ${Pose} can be arranged in any track.</li>`,
        `<li>• A ${Pose} will be infinite unless a duration is specified.</li>`,
        `<li>• You can double click on any ${Pose} to open the ${PoseEditor}.</li>`,
      ],
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureClipType(id, "pose"),
    });
  }, [ensureTimelineState]);

  /** Tour Step: Adding Poses */
  const step_checkDocs = useMemo(() => {
    const id = "tour-step-check-docs";
    const text = createText({
      title: "Check the Docs!",
      text: `To learn more about Harmonia's workflow, make sure to check out the documentation that's available from the main page! It contains useful information like:`,
      list: [
        `<li>• An explanation of every core data type, including Scales, Patterns, and Poses.</li>`,
        `<li>• A description of the website's interface, covering the Timeline, Navbar, etc.</li>`,
        `<li>• An interactive tutorial with 7 lessons to create a Project from scratch!</li>`,
      ],
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureTimelineState(id, "idle"),
    });
  }, [ensureTimelineState]);

  /** Tour Step: Saving Work */
  const step_savingWork = useMemo(() => {
    const id = "tour-step-saving-work";
    const text = createText({
      title: "Saving Your Work",
      text: `Lastly, and most importantly, don't forget to preserve your work!
      Your projects will be automatically saved in your browser, but you can also download them as HAM files.`,
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureEditorState(id, "file"),
    });
  }, [ensureEditorState]);

  /** Tour Step: CONFETTI */
  const step_confetti = useMemo(() => {
    const id = "tour-step-confetti";
    const text = createText({
      title: "Congratulations!",
      text: "That's all you need to know! We hope you enjoy using Harmonia!",
    });
    const buttons: Step.StepOptionsButton[] = [
      createButton({
        text: "Hooray!",
        classes:
          "bg-sky-600 font-bold w-full px-4 py-2 rounded-lg mr-2 hover:bg-sky-700",
      }),
    ];
    return createStep({
      id,
      text,
      buttons,
      beforeShowPromise: () =>
        new Promise<void>((resolve) => {
          dispatchCustomEvent("confetti", true);
          dispatch(hideEditor());
          resolve();
        }),
    });
  }, []);

  const steps: Step.StepOptions[] = [
    step_welcomeToHarmonia,
    step_whatIsHarmonia,
    step_trackIntro,
    step_theScaleTrack,
    step_thePatternTrack,
    step_tutorialIntro,
    step_navbarIntro,
    step_patternEditorPrompt,
    step_patternEditorIntro,
    step_patternEditorConclusion,
    step_addingPatternClips,
    step_switchingClips,
    step_workingWithPoses,
    step_checkDocs,
    step_savingWork,
    step_confetti,
  ];

  const tourOptions: Tour.TourOptions = { useModalOverlay: true };
  return {
    Button: (
      <ShepherdTour steps={steps} tourOptions={tourOptions}>
        <TourButton />
      </ShepherdTour>
    ),
  };
}

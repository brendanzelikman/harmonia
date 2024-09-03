import { useCallback, useMemo, useState } from "react";
import { Step, ShepherdTour, Tour } from "react-shepherd";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import "lib/react-shepherd.css";
import { dispatchCustomEvent } from "utils/html";
import LogoImage from "assets/images/logo.png";
import { TourButton } from "./TourButton";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { isClipType } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { TimelineState } from "types/Timeline/TimelineTypes";
import { hideEditor } from "types/Editor/EditorSlice";
import { EditorView } from "types/Editor/EditorTypes";
import { setTimelineState } from "types/Timeline/TimelineSlice";
import { selectEditor } from "types/Editor/EditorSelectors";
import { selectTimeline } from "types/Timeline/TimelineSelectors";
import { showEditor } from "types/Editor/EditorThunks";
import { setTimelineType } from "types/Timeline/TimelineThunks";

// Custom events
export const SET_TOUR_ID = "SET_TOUR_ID";
export const START_TOUR = "START_TOUR";
export const END_TOUR = "END_TOUR";
export const ADVANCE_TOUR = "ADVANCE_TOUR";

// Custom hook
export const useTourId = () => {
  const [id, setId] = useState<string | null>(null);
  useCustomEventListener(SET_TOUR_ID, (e: CustomEvent) => setId(e.detail));
  return id;
};

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
  const createText = useCallback((props: CreateTextProps) => {
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
              <ul class="flex flex-col pl-4">${props.list.join("")}</ul>
            </div>`
            : `<div class="text-lg mb-4 text-slate-300/80 font-light">${props.text}</div>`
        }
      </div>
      </div>
      `;
  }, []);

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
  const createStep = useCallback((options: Partial<Step.StepOptions>) => {
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
  }, []);

  /** A memoized promise for ensuring the editor is on a particular state */
  const ensureEditorState = useCallback(
    (id: string, view: EditorView) => {
      return () =>
        new Promise((resolve) => {
          if (isClipType(view)) dispatch(setTimelineType({ data: view }));
          if (timeline.state !== "idle") dispatch(setTimelineState("idle"));
          if (editor.view === view) return resolve(true);
          if (view === null) {
            dispatch(hideEditor({ data: null }));
          } else {
            dispatch(showEditor({ data: { view } }));
          }
          resolve(true);
        });
    },
    [editor, timeline]
  );

  /** A memoized promise for ensuring the timeline is on a particular state */
  const ensureTimelineState = useCallback(
    (id: string, state: TimelineState) => {
      return () =>
        new Promise((resolve) => {
          dispatch(hideEditor({ data: null }));
          dispatch(setTimelineState(state));
          resolve(true);
        });
    },
    []
  );

  /** A memoized promise for ensuring the timeline is on a particular state */
  const ensureClipType = useCallback((id: string, type: ClipType) => {
    return () =>
      new Promise((resolve) => {
        dispatch(setTimelineType({ data: type }));
        resolve(true);
      });
  }, []);

  // Color Coded Text
  const Scale = `<span class="text-sky-400">Scale</span>`;
  const Scales = `<span class="text-sky-400">Scales</span>`;
  const ScaleClip = `<span class="text-blue-400">Scale Clip</span>`;
  const ScaleEditor = `<span class="text-sky-400">Scale Editor</span>`;
  const ScaleTrack = `<span class="text-indigo-400">Scale Track</span>`;
  const ScaleTracks = `<span class="text-indigo-400">Scale Tracks</span>`;
  const Pattern = `<span class="text-green-400">Pattern</span>`;
  const Patterns = `<span class="text-green-400">Patterns</span>`;
  const PatternEditor = `<span class="text-green-400">Pattern Editor</span>`;
  const PatternTrack = `<span class="text-emerald-400">Pattern Track</span>`;
  const PatternTracks = `<span class="text-emerald-400">Pattern Tracks</span>`;
  const Track = `<span class="text-blue-300">Track</span>`;
  const Instrument = `<span class="text-amber-500">Instrument</span>`;
  const Instruments = `<span class="text-amber-500">Instruments</span>`;
  const InstrumentEditor = `<span class="text-amber-500">Instrument Editor</span>`;
  const Volume = `<span class="text-green-400">Volume</span>`;
  const Pan = `<span class="text-teal-400">Pan</span>`;
  const Mute = `<span class="text-red-500">Mute</span>`;
  const Solo = `<span class="text-yellow-300">Solo</span>`;
  const PatternClip = `<span class="text-teal-400">Pattern Clip</span>`;
  const PatternClips = `<span class="text-teal-400">Pattern Clips</span>`;
  const Pose = `<span class="text-fuchsia-400">Pose</span>`;
  const Poses = `<span class="text-fuchsia-400">Poses</span>`;
  const PoseEditor = `<span class="text-pose">Pose Editor</span>`;
  const Pencil = `<span class="text-green-400">Pencil</span>`;
  const Brush = `<span class="text-teal-400">Brush</span>`;

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

        dispatch(hideEditor({ data: null }));
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
      title: "Welcome to Harmonia!",
      text: "Harmonia is a pattern-based digital audio workstation (DAW) with an integrated harmonic scaffolding for powerfully automated composition!",
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: Tracks in Harmonia */
  const step_trackIntro = useMemo(() => {
    const id = "tour-step-track-intro";
    const text = createText({
      title: "Prelude: The Duality of Tracks",
      text: "In order to help you structure your music, Harmonia splits tracks into two types:",
      list: [
        `<li>• A ${ScaleTrack} has its own scale and nests other tracks to provide info.</li>`,
        `<li>• A ${PatternTrack} has its own instrument and plays notes to produce audio.</li>`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: The Scale Track */
  const step_scaleTrackIntro = useMemo(() => {
    const id = "tour-step-the-scale-track";
    const text = createText({
      title: "Chapter #1: Scale Tracks",
      text: `${ScaleTracks} are essential for storing and passing down ${Scales},
      which can be used to organize and harmonize your ${Patterns}.
      By nesting these tracks within one another, you can define scales in relation
      to other scales and create intricate musical structures.`,
      list: [
        `<li>• Every ${ScaleTrack} uses its parent scale or the chromatic scale by default.</li>`,
        `<li>• A ${ScaleTrack} can nest infinitely many ${ScaleTracks} and ${PatternTracks}.</li>`,
        `<li>• Any changes to a ${ScaleTrack} will cascade and affect all of its descendants.`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: Scale Editor Prompt */
  const step_scaleEditorPrompt = useMemo(() => {
    const id = "tour-step-scale-editor-prompt";
    const text = createText({
      title: "Quest #1: Open the Scale Editor",
      text: `Try to open the ${ScaleEditor} by clicking on the ${Scale} within a ${ScaleTrack}!`,
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      advanceOn: { selector: ".scale-track-scale-button", event: "click" },
    });
  }, []);

  /** Tour Step: Scale Editor Intro */
  const step_scaleEditorIntro = useMemo(() => {
    const id = "tour-step-scale-editor-intro";
    const text = createText({
      title: "Chapter #1 Complete!",
      text: `Congratulations, you found the ${ScaleEditor}! This is where you can view and edit all of your ${Scales}!
      Every ${ScaleTrack} will automatically come with its own ${Scale}, but
      you can also create custom scales if you would like to reuse them later on.`,
    });
    return createStep({
      id,
      text,
    });
  }, []);

  /** Tour Step: The Pattern Track */
  const step_patternTrackIntro = useMemo(() => {
    const id = "tour-step-the-pattern-track";
    const text = createText({
      title: "Chapter #2: Pattern Tracks",
      text: `${PatternTracks} are essential for storing and synthesizing your ${Instruments}, which can be used to play your ${Patterns} as audio.
      You can drag and drop ${PatternTracks} to rearrange their order or migrate them between ${ScaleTracks}.`,
      list: [
        `<li>• Every ${PatternTrack} will use a piano instrument by default.</li>`,
        `<li>• The ${Volume} & ${Pan} sliders adjust the loudness and stereo balance.</li>`,
        `<li>• The ${Mute} & ${Solo} buttons control the output relative to all tracks.</li>`,
      ],
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureEditorState(id, null),
    });
  }, []);

  /** Tour Step: Instrument Editor Prompt */
  const step_instrumentEditorPrompt = useMemo(() => {
    const id = "tour-step-instrument-editor-prompt";
    const text = createText({
      title: "Quest #2: Open the Instrument Editor",
      text: `Open the ${InstrumentEditor} by clicking on the ${Instrument} within a ${PatternTrack}!`,
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      advanceOn: {
        selector: ".pattern-track-instrument-button",
        event: "click",
      },
    });
  }, []);

  /** Tour Step: Instrument Editor Intro */
  const step_instrumentEditorIntro = useMemo(() => {
    const id = "tour-step-instrument-editor-intro";
    const text = createText({
      title: "Chapter #2 Complete!",
      text: `Congratulations, you found the ${InstrumentEditor}! 
      This is where you can view and edit all of your ${PatternTrack}'s instruments and effects.
      By the way, every sample is public domain and can be used freely in your projects!`,
    });
    return createStep({
      id,
      text,
    });
  }, []);

  /* Tour Step: Interlude Types */
  const step_interludeTypes = useMemo(() => {
    const id = "tour-step-interlude-1";
    const text = createText({
      title: "Interlude: Theme and Development",
      text: "Now that you know the basics, let's walk through the essential types of Harmonia!",
      list: [
        `<li>${Scales} are collections of notes that can be used for organization and development.</li>`,
        `<li>${Patterns} are sequences of pitches that can be arranged and transformed.</li>`,
        `<li>${Poses} are sequences of vectors that can be used to transpose scales and patterns.</li>`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /* Tour Step: Interlude Workflow */
  const step_interludeWorkflow = useMemo(() => {
    const id = "tour-step-interlude-2";
    const text = createText({
      title: "Interlude: Workflow and Navigation",
      text: `Before we continue, let's go over a sample workflow of the project:`,
      list: [
        `<li>1. Create an architecture of tracks and gather your desired ${Scales} and ${Instruments}.</li>`,
        `<li>2. Compose your ${Pattern} using scale degrees based on your ${ScaleTracks}.`,
        `<li>3. Design ${Poses} to transpose your ${Patterns} to other scales and harmonies.`,
        `<li>4. Arrange your ${Patterns} and ${Poses} in the Timeline to create your composition.`,
      ],
    });
    return createStep({ id, text });
  }, []);

  /** Tour Step: The Navbar */
  const step_navbarIntro = useMemo(() => {
    const id = "tour-step-navbar-intro";
    const text = createText({
      title: "The Navbar Is On Top!",
      text: `The Navbar lives on the top of your screen and contains many essential tools divided across four sections, described below from left to right:`,
      list: [
        `<li>1. The Project section involves your file, settings, etc.</li>`,
        `<li>2. The Transport section controls audio playback and volume.</li>`,
        `<li>3. The Toolkit section displays relevant actions for your musical objects.</li>`,
        `<li>4. The Arrangement section displays general actions for the timeline.</li>`,
      ],
    });
    return createStep({
      id,
      text,
    });
  }, []);

  /** Tour Step: Opening the Pattern Editor */
  const step_patternEditorPrompt = useMemo(() => {
    const id = "tour-step-pattern-editor-prompt";
    const text = createText({
      title: "New Quest: Open the Pattern Editor!",
      text: `Open the ${PatternEditor} by clicking on the ${Pencil} icon in the Toolkit! You may need to create a New Pattern first.`,
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      beforeShowPromise: ensureClipType(id, "pattern"),
      advanceOn: {
        selector: "#pattern-editor-button",
        event: "click",
      },
    });
  }, []);

  /** Tour Step: Pattern Editor Intro */
  const step_patternEditorIntro = useMemo(() => {
    const id = "tour-step-pattern-editor-intro";
    const text = createText({
      title: "Nice Work, You Found The Pattern Editor!",
      text: `Welcome to the ${PatternEditor}, where you can view and edit all of your patterns.`,
      list: [
        `<li>• A ${Pattern} is a sequence of notes that can be played in a ${PatternTrack}.</li>`,
        `<li>• A ${Pattern} can be bound to a ${PatternTrack}, allowing you to inherit its scales.</li>`,
        `<li>• By defining notes relative to a ${Scale}, you can easily ${Pose} to other harmonies!</li>`,
      ],
    });
    return createStep({
      id,
      text,
    });
  }, []);

  /** Tour Step: Opening the Pattern Editor */
  const step_timelineIntro = useMemo(() => {
    const id = "tour-step-timeline-intro";
    const text = createText({
      title: "3. The Timeline Arranges Everything!",
      text: `The Timeline inhabits the rest of the screen and contains your current arrangement of tracks and clips (corresponding to
          musical objects that you can edit in the Toolkit).`,
      list: [
        `<li>• A ${Pattern} Clip schedules a pattern to be played as audio.</li>`,
        `<li>• A ${Pose} Clip can temporarily or indefinitely shift the notes of a track.</li>`,
        `<li>• A ${Scale} Clip can temporarily or indefinitely change the scale of a track.</li>`,
      ],
    });
    const buttons: Step.StepOptionsButton[] = [];
    return createStep({
      id,
      text,
      buttons,
      beforeShowPromise: ensureEditorState(id, null),
    });
  }, []);

  /** Tour Step: Adding Clips */
  const step_addingPatternClips = useMemo(() => {
    const id = "tour-step-adding-pattern-clips";
    const text = createText({
      title: "3. Adding Patterns as Clips",
      text: `After selecting a ${Pattern}, you can arrange it as a ${PatternClip} by
      clicking on the ${Brush} and selecting any beat in the grid.`,
      list: [
        `<li>• A ${PatternClip} can only be arranged within a ${PatternTrack}.</li>`,
        `<li>• A ${PatternClip} will always display the name of its pattern.</li>`,
        `<li>• You can double click on any ${PatternClip} to open the ${PatternEditor}.</li>`,
      ],
    });
    return createStep({
      id,
      text,
      beforeShowPromise: ensureTimelineState(id, "adding-clips"),
    });
  }, []);

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
  }, []);

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
  }, []);

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
    });
  }, []);

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
          dispatch(hideEditor({ data: null }));
          resolve();
        }),
    });
  }, []);

  const steps: Step.StepOptions[] = [
    step_welcomeToHarmonia,
    step_whatIsHarmonia,
    step_trackIntro,
    step_scaleTrackIntro,
    step_scaleEditorPrompt,
    step_scaleEditorIntro,
    step_patternTrackIntro,
    step_instrumentEditorPrompt,
    step_instrumentEditorIntro,
    step_interludeTypes,
    step_interludeWorkflow,
    step_navbarIntro,
    step_patternEditorPrompt,
    step_patternEditorIntro,
    step_timelineIntro,
    step_addingPatternClips,
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

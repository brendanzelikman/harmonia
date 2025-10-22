import { deleteProject, getCurrentProjectId, getProjects } from "app/projects";
import { alertModal } from "components/AlertModal";
import { dispatchClose } from "hooks/useToggle";
import { DEMOS_BY_KEY } from "lib/demos";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { GiJackPlug, GiMisdirection, GiPathDistance } from "react-icons/gi";
import { selectProjectId, selectProjectName } from "types/Meta/MetaSelectors";
import { loadDemoProject } from "types/Project/ProjectLoaders";
import { dispatchCustomEvent } from "utils/event";

export const TOUR_STEPS = [
  () =>
    alertModal({
      title: `Welcome to the Tour!`,
      description:
        "This pop-up tutorial will explain the basics of Harmonia by having you take a look at the Fly Me to Barry demo project.",
    }),
  () =>
    alertModal({
      title: `The Learning Goal`,
      description:
        "By the end of this tour, we hope you will understand the structure and workflow of a Harmonia project.",
    }),
  () =>
    alertModal({
      title: `What is a Project?`,
      description: [
        "A project has three kinds of objects: Trees, Patterns, and Poses. Here is where you can see them in this project:",
        <>
          Tree {<CreateTreeIcon className="inline-flex" />} — The family of
          tracks on the left side of the screen.
        </>,
        <>
          Pattern {<ArrangePatternIcon className="inline-flex" />} — The
          sequences of clips in Samplers C and D.
        </>,
        <>
          Pose {<ArrangePoseIcon className="inline-flex" />} — The scattered
          clips across Scale B and elsewhere.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: `What is a Tree? (1/2)`,
      description: [
        "A Tree is a family of tracks created out of Scales and Samplers.",
        "- Scales are groups of notes used to organize pitch.",
        "- Samplers are instruments used to organize timbre.",
        "Together, Scales and Samplers form a musical space of notes.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Tree? (2/2)`,
      description: [
        "The tracks of a Tree are organized in a hierarchy.",
        "- Each track is given a number for position (e.g. 1, 1.1, 1.1.1)",
        "- Each track is given a letter for identity (e.g. A, B, C)",
        "This project's tree was created with the following command:",
        <span className="italic text-gray-400">
          {"A minor scale => A minor 7th chord => piano + piano"}
        </span>,
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pattern? (1/2)`,
      description: [
        "A Pattern is a sequence of Scale Notes or Pedal Notes.",
        "- Scale Notes will move around with the Scales of a Tree.",
        "- Pedal Notes will stay in place regardless of the Scales.",
        "By default, the notes you input will bind as Scale Notes.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pattern? (2/2)`,
      description: [
        "Patterns are scheduled and arranged as Clips in a Track.",
        "- You can drag and drop a Pattern to move it around.",
        "- You can double click on a Pattern to open its editor.",
        "The editor of a Pattern will let you add and remove notes.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pose? (1/2)`,
      description: [
        "A Pose is a transformation applied to a Scale or Sampler.",
        "- When applied to a Scale, it will transform and cascade.",
        "- When applied to a Sampler, it will transform in place.",
        "Like Patterns, Poses are scheduled and arranged as Clips.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pose? (2/2)`,
      description: [
        "Poses can have many different applications in a project:",
        "- The Poses in Track #1 change around the octave and mode.",
        "- The Poses in Track #1.1 create the main chord progression.",
        "- The Poses in Track #1.1.2 invert the background chords.",
        "Poses can even use custom functions written in JavaScript!",
      ],
    }),
  () =>
    alertModal({
      title: `Review: Project Structure`,
      description: [
        "Great job, you've reached the halfway point! Let's review:",
        "- Trees are used to organize your Scales and Samplers.",
        "- Patterns are sequences of notes played by Samplers.",
        "- Poses are transformations applied to Scales and Samplers.",
        "Together, these objects form the structure of a project.",
      ],
    }),
  () =>
    alertModal({
      title: `What are Gestures? (1/2)`,
      description:
        "To speed up the workflow of a project, Harmonia comes with a variety of keyboard shortcuts called Gestures.",
    }),
  () =>
    alertModal({
      title: `What are Gestures? (2/2)`,
      description: [
        "Currently, Harmonia has three kinds of gestures:",
        <>
          Transposition {<GiMisdirection className="inline-flex" />} — Create
          poses based on numerical offsets.
        </>,
        <>
          Variation {<GiPathDistance className="inline-flex" />} — Create poses
          based on algorithmic rules.
        </>,
        <>
          Dynamics {<GiJackPlug className="inline-flex" />} — Control the audio
          output of your samplers.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: `Gesture - Transposition`,
      description: [
        "Transposition allows you to move along your scales.",
        "- Hold Q and press 1 to move one step up the first scale.",
        "- Hold Q and press -1 to move one step down the scale.",
        "- Hold T + Y and press 1 to move one semitone and octave up.",
        "- Press 0 to clear all previous transpositions.",
      ],
    }),
  () =>
    alertModal({
      title: `Gesture - Variation`,
      description: [
        "Variation allows you to move based on other rules.",
        "- Hold C and press 1 to find the closest variation up.",
        "- Hold C and press -1 to find the closest variation down.",
        "- Hold D and press 4 to find the closest dominant chord.",
        "- Hold D and press -4 to find the closest subdominant chord.",
      ],
    }),
  () =>
    alertModal({
      title: `Gesture - Dynamics`,
      description: [
        "Dynamics allows you to move the volume of your samplers.",
        "- Hold V and press 1 to make the first sampler a little louder.",
        "- Hold V and press -1 to make the first sampler a little quieter.",
        "- Hold M and press 1 to mute the first sampler.",
        "- Hold M and press 0 to unmute all samplers.",
      ],
    }),
  () =>
    alertModal({
      title: `Gesture - Instructions (1/2)`,
      description: [
        "To aid with live performance, Harmonia allows you to schedule Gestures as Instructions that pop up for you during playback.",
      ],
    }),
  () =>
    alertModal({
      title: `Gesture - Instructions (2/2)`,
      description: [
        "You may have noticed there are Instructions available for this project in the top left corner. Yes, you are about to perform!",
      ],
    }),
  () =>
    alertModal({
      autoselect: false,
      title: `Performance?! (1/2)`,
      description: [
        "Before you start, let's explain what you're about to do:",
        "- Scale B has a harmonic progression that keeps moving up.",
        "- Sampler C needs counteracting motion to stay in range.",
        "Press Space to hear what the piece sounds like right now.",
        "Press Return to stop playback and proceed with the tour.",
      ],
    }),
  () =>
    alertModal({
      title: `Performance?! (2/2)`,
      description: [
        "Musical puzzles like these are at the heart of Harmonia!",
        "There are infinitely many ways to approach the 'solution'.",
        "The Instructions here guide you through one possible path.",
        "But how much you move down, when, why, it's all up to you!",
        "Alright, enough talking, it is time for you to shine!",
      ],
    }),
  () =>
    alertModal({
      autoselect: false,
      title: "Take It Away!",
      description: [
        "To get ready, press Shift + 3 to select the third track.",
        "When you are ready, press Space to begin playback.",
        "Follow the Instructions and press the shortcuts to the beat!",
        "If you make a mistake, don't worry, that's improv!",
        "Once you are done, press Return to stop and proceed.",
      ],
    }),
  () =>
    alertModal({
      title: "You Did It!",
      description: [
        "Congratulations, that was a fantastic performance!",
        "We hope you had fun and learned something new.",
        "Just in case, here's a final tip for you:",
        "- The top left button is a menu for projects and demos.",
        "That's all for now, see you next time!",
      ],
    }),
];

export const startTour = async () => {
  for (let i = 0; i < TOUR_STEPS.length; i++) {
    const step = TOUR_STEPS[i];
    const result = await step();
    if (!result) break;
  }
  return true;
};

const tourName = "Harmonia Tour";

export const playTour = async () => {
  const projects = await getProjects();
  const currentId = getCurrentProjectId();
  let flag = false;

  // Delete projects that match the tour name
  for (const project of projects) {
    const id = selectProjectId(project);
    if (id === currentId) {
      flag = true;
      continue;
    }
    const name = selectProjectName(project);
    if (name === tourName) {
      await deleteProject(id);
    }
  }
  await loadDemoProject(DEMOS_BY_KEY["tour"].project, startTour);
  dispatchClose("brand");

  // Delete the previous tour after loading the new tour
  if (currentId && flag) {
    await deleteProject(currentId);
  }
};

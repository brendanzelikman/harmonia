import { alertModal } from "components/AlertModal";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { GiJackPlug, GiMisdirection, GiPathDistance } from "react-icons/gi";

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
          Pose {<ArrangePoseIcon className="inline-flex" />} — The clusters of
          clips across Scales A, B, and C.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: `What is a Tree?`,
      description: [
        "A Tree is a family of tracks created out of Scales and Samplers.",
        "Scales are used for organizing the pitch classes of your notes.",
        "Samplers are used for determining the timbres of your notes.",
        "This project's tree was created with the following command:",
        <span className="italic text-gray-400">
          {"A minor scale => A minor 7th chord => piano + piano"}
        </span>,
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pattern?`,
      description: [
        "A Pattern is a sequence of notes that can be played by a track.",
        "Here, Pattern 1 has the melody and Pattern 2 has the chords.",
        "These two patterns repeat until the end of the project.",
        "You can double click on a Pattern to open its dropdown editor.",
        "You can drag and drop a Pattern to move it around the timeline.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pose?`,
      description: [
        "A Pose is a transformation applied to a Scale or Pattern.",
        "The Poses in Track #1 change around the octave and mode.",
        "The Poses in Track #1.1 create the central chord progression.",
        "The Poses in Track #1.1.3 invert the background chords.",
        "You can double click, drag, and drop a Pose like a Pattern.",
      ],
    }),
  () =>
    alertModal({
      title: `Reviewing the Project`,
      description: [
        "Let's review the structure and purpose of each object:",
        "Trees can be edited to change the base Scales and Samplers.",
        "Patterns can be arranged to create melodies and rhythms.",
        "Poses can be arranged to transform Scales and Patterns.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Gesture?`,
      description:
        "To speed up the workflow of a project, Harmonia comes with a variety of keyboard shortcuts called Gestures.",
    }),
  () =>
    alertModal({
      title: `What are the Gestures?`,
      description: [
        "Currently, Harmonia has three kinds of Gestures:",
        <>
          Transposition {<GiMisdirection className="inline-flex" />} — Create
          poses based on numerical offsets.
        </>,
        <>
          Voice Leading {<GiPathDistance className="inline-flex" />} — Create
          poses based on algorithmic rules.
        </>,
        <>
          Dynamics {<GiJackPlug className="inline-flex" />} — Control the audio
          output of your samplers.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: `Testing your Gestures`,
      description: [
        "To test out your gestures, try these different actions.",
        "Hold V and press 1 to make the first sampler a little louder.",
        "Hold V and Minus and press 1 to make it a little quieter.",
        "Hold Q and press 1 to move one step up the first scale.",
        "Hold Q and Minus and press 1 to move one step down.",
      ],
    }),
  () =>
    alertModal({
      title: `What are Instructions?`,
      description:
        "Harmonia allows you to turn Gestures into Instructions that can display keyboard shortcuts for you in real-time.",
    }),
  () =>
    alertModal({
      title: "Finishing the Demo",
      description: `To complete this tutorial, we'll have you follow the Instructions of the project to see the Transposition gesture in action.`,
    }),
  () => () =>
    alertModal({
      title: `What is a Voice Leading?`,
      description: [
        "To prepare you for the exercise, we need to cover voice leadings.",
        "In practice, voice leadings take notes along unique paths.",
        "In theory, this is equivalent to transposition along scales.",
        "In Harmonia, we can create voice leadings out of Poses.",
      ],
    }),
  () =>
    alertModal({
      title: `Previewing the Piece`,
      description: [
        "First, let's listen to the 'incomplete' version of the piece.",
        "All of the chords are correct, but something will sound off.",
        "Press Space to start the timeline and try to figure out what it is.",
        "Press Return to stop the timeline and proceed with the tour.",
      ],
    }),
  () =>
    alertModal({
      title: `What is the Problem?`,
      description: [
        "The problem is that the melody doesn't stop moving up.",
        "In practice, efficient voice leadings keep notes close together.",
        "In theory, this is equivalent to contrasting transpositions.",
        "In Harmonia, we could create many different Poses to 'fix' this.",
      ],
    }),
  () =>
    alertModal({
      title: `This is the Workflow!`,
      description: [
        "These 'musical puzzles' lie at the heart of Harmonia.",
        "In theory, there are infinitely many solutions, all valid.",
        "In practice, there are solutions we like more than others.",
        "Exploring your different options is what it's all about!",
      ],
    }),
  () =>
    alertModal({
      title: `Your Turn!`,
      description: [
        "Alright! Now it's your turn to perform!",
        "You may have noticed your Instructions in the top left corner.",
        "These will signal Gestures for you to create Poses in real time.",
        "To prepare, press Shift + 3 to select your third Track.",
      ],
    }),
  () =>
    alertModal({
      title: "Have Fun!",
      description: [
        "When you are ready, press Space to start the timeline.",
        "Follow the Instructions and have fun with the piece!",
        "Once you are done, press Return to stop and proceed.",
      ],
    }),
  () =>
    alertModal({
      title: "That's All!",
      description: [
        "Congratulations, that was a fantastic performance!",
        "We hope you are ready to create and explore on your own!",
        "The top left icon has a menu for all of your projects.",
        "We recommend opening other demos to see what's possible.",
        "That's all for now, until next time!",
      ],
    }),
];

export const launchTour = async () => {
  for (let i = 0; i < TOUR_STEPS.length; i++) {
    const step = TOUR_STEPS[i];
    const result = await step();
    if (!result) break;
  }
  return true;
};

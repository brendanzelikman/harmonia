import { alertModal } from "components/AlertModal";
import { DEMOS_BY_KEY } from "lib/demos";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { GiJackPlug, GiMisdirection, GiPathDistance } from "react-icons/gi";
import { loadDemoProject } from "types/Project/ProjectLoaders";

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
          Pose {<ArrangePoseIcon className="inline-flex" />} — The cluster of
          clips across Scales B and elsewhere.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: `What is a Tree? (1/2)`,
      description: [
        "A Tree is a family of tracks created from Scales and Samplers.",
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
        "- When applied to a Scale, it will cascade down the Tree.",
        "- When applied to a Sampler, it will transform its Patterns.",
        "Like Patterns, Poses are scheduled and arranged as Clips.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Pose? (2/2)`,
      description: [
        "Poses can have many different applications in a project:",
        "- The Poses in Track #1 change around the octave and mode.",
        "- The Poses in Track #1.1 create the central chord progression.",
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
        "- Patterns are arranged as Clips to play out notes.",
        "- Poses are arranged as Clips to transform notes.",
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
      title: `Testing Your Gestures`,
      description: [
        "To test out some gestures, try these different actions:",
        "- Hold V and press 1 to make the first sampler a little louder.",
        "- Hold V and Minus and press 1 to make it a little quieter.",
        "- Hold Q and press 1 to move one step up the first scale.",
        "- Hold Q and Minus and press 1 to move one step down.",
      ],
    }),
  () =>
    alertModal({
      title: `Saving Your Gestures`,
      description:
        "Harmonia allows you to turn Gestures into Instructions that can display keyboard shortcuts for you in real-time.",
    }),
  () =>
    alertModal({
      title: "Exploring Your Gestures",
      description: `To complete this tutorial, we'll have you follow the Instructions of this project to see your Gestures in action.`,
    }),
  () =>
    alertModal({
      title: `What is a Voice Leading? (1/2)`,
      description: [
        "Before you start, we need to prepare you about voice leading.",
        "- In theory, a voice leading is a unique path taken by notes.",
        "- In practice, this can be equivalent to transposition.",
        "This means that Poses can be used to create voice leadings.",
      ],
    }),
  () =>
    alertModal({
      title: `What is a Voice Leading? (2/2)`,
      description: [
        "However, not all voice leadings are created equal.",
        "Let's check out this piece and try to hear what's 'wrong'.",
        "- Press Space to start the timeline when you're ready.",
        "- Press Return to stop the timeline and proceed with the tour.",
      ],
    }),
  () =>
    alertModal({
      title: `What's the 'Problem' Here?'`,
      description: [
        "The 'problem' is that the melody moves too high up the scale.",
        "- In theory, an 'efficient' voice leading keeps notes close.",
        "- In practice, this can be achieved with opposing transpositions.",
        "In this case, we could add Poses that move the melody down.",
      ],
    }),
  () =>
    alertModal({
      title: `This is the Workflow!`,
      description: [
        "These 'musical puzzles' lie at the heart of Harmonia.",
        "In theory, there are infinitely many solutions, all valid.",
        "In practice, there are solutions we might prefer over others.",
        "Exploring your different options is what it's all about!",
      ],
    }),
  () =>
    alertModal({
      title: `The Final Exercise!`,
      description: [
        "Alright! Now it's your turn to perform the piece!",
        "Your Instructions are displayed in the top left corner.",
        "The goal is to follow the Instructions as best as you can.",
        "To get ready, press Shift + 3 to select your third Track.",
      ],
    }),
  () =>
    alertModal({
      title: "Have Fun!",
      description: [
        "When you are ready, press Space to begin playback.",
        "Follow the Instructions and have fun with the piece!",
        "If you make a mistake, don't worry, that's improv!",
        "Once you are done, press Return to stop and proceed.",
      ],
    }),
  () =>
    alertModal({
      title: "You Did It!",
      description: [
        "Congratulations, that was a fantastic performance!",
        "We hope you are ready to create and explore on your own!",
        "The top left icon can be clicked to see projects and demos.",
        "We recommend opening other pieces to see what's possible.",
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

export const playTour = () =>
  loadDemoProject(DEMOS_BY_KEY["barry_game"].project, startTour);

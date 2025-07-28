import { alertModal } from "components/AlertModal";
import { ArrangePatternIcon, ArrangePoseIcon } from "lib/hotkeys/timeline";
import { CreateTreeIcon } from "lib/hotkeys/track";

export const TOUR_STEPS = [
  () =>
    alertModal({
      title: `Welcome to the Tour!`,
      description:
        "This pop-up tutorial will explain the basics of a project by guiding you through a sample workflow.",
    }),
  () =>
    alertModal({
      title: `The Learning Goal`,
      description:
        "By the end of this tour, we hope you will have the tools you need to create and explore on your own.",
    }),
  () =>
    alertModal({
      title: `Motifs`,
      description: [
        "Motifs are the building blocks of your project. Here is where you can see them in this project:",
        <>
          Tree {<CreateTreeIcon className="inline-flex" />} — The family of
          tracks on the left side of the screen.
        </>,
        <>
          Pattern {<ArrangePatternIcon className="inline-flex" />} — The
          sequence of clips scheduled in Sampler D.
        </>,
        <>
          Pose {<ArrangePoseIcon className="inline-flex" />} — The clusters of
          clips across Scales A, B, and C.
        </>,
      ],
    }),
  () =>
    alertModal({
      title: ``,
      description:
        "In Harmonia, the default starting point of a project is a tree with a pattern and a pose.",
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
    }),
  () =>
    alertModal({
      title: ``,
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

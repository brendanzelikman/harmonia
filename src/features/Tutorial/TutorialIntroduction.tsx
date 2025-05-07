import { m } from "framer-motion";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";
import { GiBookCover, GiPineTree, GiWateringCan } from "react-icons/gi";
import { promptUserForTree } from "lib/prompts/tree";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";

export const tutorialVariants = {
  hidden: { opacity: 0, scale: 0 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0, delayChildren: 0.4, staggerChildren: 0.2 },
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};
export const sonataVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const TutorialIntroduction = (props: {
  view: string;
  setView: (view: string) => void;
  tutorial: boolean;
  startTutorial: () => void;
}) => {
  const dispatch = useAppDispatch();
  return (
    <m.div
      initial="hidden"
      animate="show"
      whileInView="enter"
      data-view={props.view}
      variants={tutorialVariants}
      className="hidden data-[view=introduction]:flex items-center max-lg:flex-col gap-8 lg:gap-16"
    >
      <TimelineButton
        border="ring-indigo-600/80"
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-xs lg:py-12 lg:gap-3"
        title="Start Project"
        titleClass={"text-2xl font-normal"}
        subtitle="Create a New Tree"
        stripColor="text-lg font-light"
        Icon={GiWateringCan}
        iconClass="text-9xl max-lg:text-6xl"
        onClick={() => dispatch(promptUserForTree)}
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-xs lg:py-12 lg:gap-3"
        title="Quickstart Project"
        subtitle="Grow a Default Tree"
        titleClass={"text-2xl font-normal"}
        stripColor="text-lg font-light"
        Icon={GiPineTree}
        iconClass="text-9xl max-lg:text-6xl"
        onClick={() => dispatch(toggleLivePlay())}
      />
      <TimelineButton
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-xs lg:py-12 lg:gap-3"
        border="ring-fuchsia-600/80"
        title={props.tutorial ? "Begin Tutorial" : "Launch Tutorial"}
        titleClass={"text-2xl font-normal"}
        subtitle="Packaged in Sonata Form"
        stripColor="text-lg font-light"
        Icon={GiBookCover}
        iconClass="text-9xl max-lg:text-6xl"
        onClick={() => props.startTutorial()}
      />
    </m.div>
  );
};

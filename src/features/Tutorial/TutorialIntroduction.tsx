import { m } from "framer-motion";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";
import { GiTreeDoor } from "react-icons/gi";
import { promptUserForTree } from "lib/prompts/tree";
import { growTree } from "types/Timeline/TimelineThunks";
import { CreateTreeHotkey, CreateTreeIcon } from "lib/hotkeys/track";
import { WaterTreeHotkey, WaterTreeIcon } from "lib/hotkeys/timeline";

const variants = {
  hidden: { opacity: 0, translateX: -20 },
  enter: {
    opacity: 1,
    transition: { delay: 0, delayChildren: 0.1, staggerChildren: 0.1 },
  },
  show: {
    opacity: 1,
    transition: {
      delay: 0,
      delayChildren: 0.8,
      staggerChildren: 0.1,
    },
  },
};
export const tutorialVariants = {
  hidden: { opacity: 0, translateX: -20 },
  show: { opacity: 1, translateX: 0 },
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
      data-view={props.view}
      initial="hidden"
      animate="show"
      variants={variants}
      className="hidden data-[view=introduction]:flex items-center max-lg:flex-col gap-12 pt-2"
    >
      <TimelineButton
        border="ring-cyan-600"
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-68 lg:py-12 lg:gap-3"
        title={CreateTreeHotkey.name}
        titleClass={"text-xl font-semibold"}
        subtitle="Input Tracks by Prompt"
        stripColor="text-lg font-light"
        background="hover:bg-teal-500/5 bg-slate-950/25"
        Icon={CreateTreeIcon}
        iconClass="text-8xl max-lg:text-6xl"
        onClick={() => dispatch(promptUserForTree)}
      />
      <TimelineButton
        border="ring-teal-600"
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-68 lg:py-12 lg:gap-3"
        title={WaterTreeHotkey.name}
        subtitle="Quickstart and Randomize"
        titleClass={"text-xl font-semibold"}
        stripColor="text-lg font-light"
        background="hover:bg-cyan-500/5 bg-slate-950/25"
        Icon={WaterTreeIcon}
        iconClass="text-8xl max-lg:text-6xl"
        onClick={() => dispatch(growTree())}
      />
      <TimelineButton
        className="lg:rounded-full flex-row lg:flex-col shadow-xl w-68 lg:py-12 lg:gap-3"
        border="ring-fuchsia-600"
        title={"What's a Tree?"}
        titleClass={"text-xl font-semibold"}
        subtitle="Start the Tutorial"
        stripColor="text-lg font-light"
        background="hover:bg-fuchsia-500/5 bg-slate-950/25"
        Icon={GiTreeDoor}
        iconClass="text-8xl max-lg:text-6xl"
        onClick={() => props.startTutorial()}
      />
    </m.div>
  );
};

import { m } from "framer-motion";
import { TimelineButton } from "./components/TutorialButton";
import { useAppDispatch } from "hooks/useRedux";
import { GiBookCover, GiPaintRoller, GiPalette } from "react-icons/gi";
import { promptUserForTree } from "lib/prompts/tree";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";

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
      data-view={props.view}
      variants={{
        hidden: { scale: 0, opacity: 0 },
        show: {
          opacity: 1,
          scale: 1,
          transition: {
            delayChildren: 0.3,
            staggerChildren: 0.1,
            type: "spring",
            stiffness: 100,
            mass: 0.6,
          },
        },
      }}
      className="hidden lg:mt-10 lg:*:h-72 data-[view=introduction]:flex max-lg:flex-col max-lg:items-center gap-8 lg:gap-16 max-lg:overflow-scroll p-4"
    >
      <TimelineButton
        border="ring-indigo-600/80"
        className="rounded-4xl shadow-xl w-[350px] total-center-col lg:gap-4"
        title={`Start Project`}
        titleClass={"text-2xl font-normal"}
        subtitle="Create a New Tree"
        stripColor="text-lg font-light"
        Icon={GiPalette}
        iconClass="text-9xl max-lg:text-6xl"
        onClick={() => dispatch(promptUserForTree)}
      />
      <TimelineButton
        border="ring-teal-600/80"
        className="rounded-4xl shadow-xl w-[350px] total-center-col lg:gap-4"
        title="Quickstart Project"
        subtitle="Create a Default Tree"
        titleClass={"text-2xl font-normal"}
        stripColor="text-lg font-light"
        Icon={GiPaintRoller}
        iconClass="text-9xl max-lg:text-6xl"
        onClick={() => dispatch(toggleLivePlay())}
      />
      <TimelineButton
        className="rounded-4xl shadow-xl w-[350px] total-center-col lg:gap-4"
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

import { PlaygroundMobileSplash } from "./components/PlaygroundMobileSplash";
import { PlaygroundLoadingScreen } from "./components/PlaygroundLoadingScreen";
import { usePlaygroundLoader } from "./hooks/usePlaygroundLoader";
import { Timeline } from "features/Timeline/Timeline";
import { TimelinePlaceholder } from "features/Timeline/components/TimelinePlaceholder";
import { TimelineStart } from "features/Timeline/components/TimelineStart";
import { ShortcutsMenu } from "features/Shortcuts/ShortcutsMenu";
import { use } from "types/hooks";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { selectHideTimeline } from "types/Meta/MetaSelectors";
import { Diary } from "features/Diary/Diary";
import { Editor } from "features/Editor/Editor";
import { Terminal } from "features/Diary/Terminal";

/** The playground contains the DAW */
export function Playground() {
  const loadState = usePlaygroundLoader();
  const hideTimeline = use(selectHideTimeline);
  const hasTracks = use(selectHasTracks);

  // If the playground is not loaded, show the loading screen.
  if (!loadState.isPlaygroundLoaded) {
    return <PlaygroundLoadingScreen loadState={loadState} />;
  }

  // Otherwise, show the playground.
  return (
    <div className="size-full animate-in fade-in duration-150">
      <Diary />
      <Terminal />
      <div className="relative hidden md:flex flex-col h-full">
        {hideTimeline ? (
          <TimelinePlaceholder />
        ) : hasTracks ? (
          <Timeline />
        ) : (
          <TimelineStart />
        )}
        <Editor />
        <ShortcutsMenu />
      </div>
      <PlaygroundMobileSplash />
    </div>
  );
}

import { PlaygroundMobileSplash } from "./components/PlaygroundMobileSplash";
import { PlaygroundLoadingScreen } from "./components/PlaygroundLoadingScreen";
import { usePlaygroundLoader } from "./hooks/usePlaygroundLoader";
import { useGlobalHotkeys, useMidiController } from "hooks";
import { Timeline } from "features/Timeline/Timeline";
import { TimelinePlaceholder } from "features/Timeline/components/TimelinePlaceholder";
import { TimelineStart } from "features/Timeline/components/TimelineStart";
import { ShortcutsMenu } from "features/Shortcuts/ShortcutsMenu";
import { Diary } from "features/Diary";
import { useProjectSelector } from "types/hooks";
import { Editor } from "features/Editor/Editor";
import { selectHasTracks } from "types/Arrangement/ArrangementSelectors";
import { selectTimeline } from "types/Timeline/TimelineSelectors";

/** The playground contains the DAW */
export function Playground() {
  const loadState = usePlaygroundLoader();
  const { performanceMode } = useProjectSelector(selectTimeline);
  const hasTracks = useProjectSelector(selectHasTracks);
  useGlobalHotkeys();
  useMidiController();

  // If the playground is not loaded, show the loading screen.
  if (!loadState.isPlaygroundLoaded) {
    return <PlaygroundLoadingScreen loadState={loadState} />;
  }

  // Otherwise, show the playground.
  return (
    <div className="size-full animate-in fade-in duration-150">
      <Diary />
      <div className="relative hidden md:flex flex-col h-full">
        {!!performanceMode ? (
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

import { PlaygroundLoadingScreen } from "./components/PlaygroundLoadingScreen";
import { Timeline } from "features/Timeline/Timeline";
import { Shortcuts } from "features/Shortcuts/Shortcuts";
import { Diary } from "features/Diary/Diary";

import { Terminal } from "features/Diary/Terminal";
import { dispatchEventOnChange } from "utils/html";
import { usePlaygroundProject } from "./hooks/usePlaygroundProject";
import { usePlaygroundTransport } from "./hooks/usePlaygroundTransport";
import { useTimelineHotkeys } from "features/Timeline/hooks/useTimelineHotkeys";
import { usePlaygroundHotkeys } from "./hooks/usePlaygroundHotkeys";
import { Editor } from "features/Editor/Editor";

/** The playground loads when the project and transport are ready */
export function PlaygroundPage() {
  const isProjectLoaded = usePlaygroundProject();
  const isTransportLoaded = usePlaygroundTransport();
  const isPlaygroundLoaded = !!(isProjectLoaded && isTransportLoaded);
  dispatchEventOnChange("playground-loaded", isPlaygroundLoaded);
  usePlaygroundHotkeys();
  useTimelineHotkeys();

  // If the playground is not loaded, show the loading screen.
  if (!isPlaygroundLoaded) {
    return <PlaygroundLoadingScreen isLoaded={isTransportLoaded} />;
  }

  // Otherwise, show the playground.
  return (
    <div className="size-full animate-in fade-in duration-150">
      <Diary />
      <Terminal />
      <div className="relative flex flex-col h-full">
        <Timeline />
        <Editor />
        <Shortcuts />
      </div>
    </div>
  );
}

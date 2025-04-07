import { LoadingScreen } from "./pages/Playground/components/LoadingScreen";
import { Timeline } from "features/Timeline/Timeline";
import { Shortcuts } from "features/Shortcuts/Shortcuts";
import { Diary } from "features/Diary/Diary";
import { Terminal } from "terminal";
import { dispatchEventOnChange } from "utils/html";
import { usePlaygroundProject } from "./pages/Playground/hooks/usePlaygroundProject";
import { useTimelineHotkeys } from "pages/Playground/hotkeys/useTimelineHotkeys";
import { usePlaygroundHotkeys } from "./pages/Playground/hotkeys/usePlaygroundHotkeys";
import { Editor } from "features/Editor/Editor";
import { usePlaygroundTransport } from "./pages/Playground/hooks/usePlaygroundTransport";

export const LOAD_PLAYGROUND = "load-playground";

/** The playground loads when the project and transport are ready */
export function PlaygroundPage() {
  const isProjectLoaded = usePlaygroundProject();
  const isTransportLoaded = usePlaygroundTransport();
  const isPlaygroundLoaded = isProjectLoaded && isTransportLoaded;
  dispatchEventOnChange(LOAD_PLAYGROUND, isPlaygroundLoaded);

  // Return the playground when everything is loaded
  if (isProjectLoaded && isTransportLoaded) return <Playground />;

  // Otherwise, show a loading screen
  let text = "Loading Projects...";
  if (isProjectLoaded) text = "Building Instruments...";
  return <LoadingScreen text={text} />;
}

/** The Playground controls all of the main components and hotkeys */
export function Playground() {
  usePlaygroundHotkeys();
  useTimelineHotkeys();
  return (
    <div className="size-full relative">
      <Timeline />
      <Editor />
      <Diary />
      <Terminal />
      <Shortcuts />
    </div>
  );
}

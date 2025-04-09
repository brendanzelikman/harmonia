import { Shortcuts } from "features/Shortcuts/Shortcuts";
import { Diary } from "features/Diary/Diary";
import { dispatchEventOnChange } from "utils/html";
import { useTimelineHotkeys } from "features/Playground/useTimelineHotkeys";
import { Editor } from "features/Editor/Editor";
import { Terminal } from "features/Terminal/Terminal";
import { Tutorial } from "features/Tutorial/Tutorial";
import { Timeline } from "features/Timeline/Timeline";
import { usePlaygroundHotkeys } from "./usePlaygroundHotkeys";
import { usePlaygroundProject } from "./usePlaygroundProject";
import { usePlaygroundTransport } from "./usePlaygroundTransport";
import { PlaygroundLoadingScreen } from "./PlaygroundLoadingScreen";
import { useStore } from "hooks/useStore";
import { selectHasTracks } from "types/Track/TrackSelectors";

export const LOAD_PLAYGROUND = "load-playground";

/** The playground loads when the project and transport are ready */
export function PlaygroundPage() {
  const isProjectLoaded = usePlaygroundProject();
  const isTransportLoaded = usePlaygroundTransport();
  const isPlaygroundLoaded = isProjectLoaded && isTransportLoaded;

  // Return the playground when everything is loaded
  dispatchEventOnChange(LOAD_PLAYGROUND, isPlaygroundLoaded);
  if (isProjectLoaded && isTransportLoaded) return <Playground />;

  // Otherwise, show a loading screen
  return (
    <PlaygroundLoadingScreen
      text={isProjectLoaded ? "Building Instruments..." : "Loading Project..."}
    />
  );
}

/** The Playground controls all of the main components and hotkeys */
export function Playground() {
  const hasTracks = useStore(selectHasTracks);
  usePlaygroundHotkeys();
  useTimelineHotkeys();
  return (
    <div className="size-full relative">
      {hasTracks ? <Timeline /> : <Tutorial />}
      <Editor />
      <Diary />
      <Terminal />
      <Shortcuts />
    </div>
  );
}

import { Shortcuts } from "features/Shortcuts/Shortcuts";
import { Diary } from "features/Diary/Diary";
import { dispatchCustomEventOnChange } from "utils/event";
import { Editor } from "features/Editor/Editor";
import { Terminal } from "features/Terminal/Terminal";
import { Tutorial } from "features/Tutorial/Tutorial";
import { Timeline } from "features/Timeline/Timeline";
import { usePlaygroundTransport } from "./usePlaygroundTransport";
import { PlaygroundLoadingScreen } from "./PlaygroundLoadingScreen";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { useHotkeys } from "hooks/useHotkeys";
import { hotkeys } from "lib/hotkeys";

export const LOAD_PLAYGROUND = "load-playground";

/** The playground loads when the project and transport are ready */
export function PlaygroundPage() {
  const hasTracks = useAppValue(selectHasTracks);
  const isTransportLoaded = usePlaygroundTransport();
  dispatchCustomEventOnChange(LOAD_PLAYGROUND, isTransportLoaded);
  useHotkeys(hotkeys);

  // Show loading screen while transport is loading
  if (!isTransportLoaded) {
    return <PlaygroundLoadingScreen text="Building Instruments..." />;
  }

  // Show the playground when transport is loaded
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

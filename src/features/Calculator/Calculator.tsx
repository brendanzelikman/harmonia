import { dispatchCustomEventOnChange } from "utils/event";
import { useTransport } from "../../hooks/useTransport";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import Editor from "features/Editor/Editor";
import Shortcuts from "features/Shortcuts/Shortcuts";
import Terminal from "features/Terminal/Terminal";
import Tutorial from "features/Tutorial/Tutorial";
import Timeline from "features/Timeline/Timeline";

export const LOAD_CALCULATOR = "load-calculator";

/** The calculator loads when the project and transport are ready */
export default function Calculator() {
  const hasTracks = useAppValue(selectHasTracks);
  return (
    <div className="size-full relative">
      <Timeline />
      {!hasTracks && <Tutorial />}
      <Editor />
      <Terminal />
      <Shortcuts />
    </div>
  );
}

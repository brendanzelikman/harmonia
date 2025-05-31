import { dispatchCustomEventOnChange } from "utils/event";
import { useTransport } from "../../hooks/useTransport";
import { CalculatorLoadingScreen } from "./CalculatorLoadingScreen";
import { useAppValue } from "hooks/useRedux";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { useHotkeys } from "hooks/useHotkeys";
import { hotkeyMap } from "lib/hotkeys";
import Editor from "features/Editor/Editor";
import Shortcuts from "features/Shortcuts/Shortcuts";
import Terminal from "features/Terminal/Terminal";
import Tutorial from "features/Tutorial/Tutorial";
import Timeline from "features/Timeline/Timeline";

export const LOAD_CALCULATOR = "load-calculator";

/** The calculator loads when the project and transport are ready */
export default function Calculator() {
  const hasTracks = useAppValue(selectHasTracks);
  const isTransportLoaded = useTransport();
  dispatchCustomEventOnChange(LOAD_CALCULATOR, isTransportLoaded);
  useHotkeys(hotkeyMap);

  // Show loading screen while transport is loading
  if (!isTransportLoaded) {
    return <CalculatorLoadingScreen text="Building Instruments..." />;
  }

  // Render when transport is loaded
  return (
    <div className="size-full relative">
      {hasTracks ? <Timeline /> : <Tutorial />}
      <Editor />
      <Terminal />
      <Shortcuts />
    </div>
  );
}

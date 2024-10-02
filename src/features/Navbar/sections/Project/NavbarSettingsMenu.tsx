import {
  MIN_CELL_WIDTH,
  MAX_CELL_WIDTH,
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
} from "utils/constants";
import { useEffect, useState } from "react";
import { clamp } from "lodash";
import { use, useProjectDispatch, useProjectSelector } from "types/hooks";
import { dispatchCustomEvent, onEnter } from "utils/html";
import classNames from "classnames";
import { GiSettingsKnobs } from "react-icons/gi";
import { percent } from "utils/math";
import { setCellWidth } from "types/Timeline/TimelineSlice";
import { DEFAULT_CELL_WIDTH } from "types/Timeline/TimelineTypes";
import { selectCellWidth } from "types/Timeline/TimelineSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  setTransportBPM,
  setTransportTimeSignature,
} from "types/Transport/TransportThunks";
import {
  selectHideTimeline,
  selectHideTooltips,
} from "types/Meta/MetaSelectors";
import { toggleTimeline, toggleTooltips } from "types/Meta/MetaSlice";
import {
  NavbarFormGroup,
  NavbarFormInput,
  NavbarFormButton,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { TOGGLE_STATE } from "hooks/useToggledState";

export function NavbarSettingsMenu() {
  const dispatch = useProjectDispatch();
  const { bpm, timeSignature } = useProjectSelector(selectTransport);
  const hideTooltips = use(selectHideTooltips);
  const hideTimeline = use(selectHideTimeline);
  const cellWidth = useProjectSelector(selectCellWidth);

  // The BPM field changes the tempo of the transport
  const [BPMInput, setBPMInput] = useState(bpm);
  useEffect(() => setBPMInput(bpm), [bpm]);
  const BPMField = (
    <NavbarFormGroup>
      <NavbarSettingsLabel>Tempo (BPM)</NavbarSettingsLabel>
      <NavbarFormInput
        className="focus:bg-slate-900/25 max-w-16 h-7"
        type="number"
        placeholder={DEFAULT_BPM.toString()}
        value={BPMInput}
        min={MIN_BPM}
        max={MAX_BPM}
        onChange={(e) => setBPMInput(e.target.valueAsNumber)}
        onKeyDown={(e) =>
          onEnter(e, () => {
            const currentValue = e.currentTarget.valueAsNumber;
            if (isNaN(currentValue)) return;
            const newValue = clamp(currentValue, MIN_BPM, MAX_BPM);
            setBPMInput(newValue);
            dispatch(setTransportBPM(newValue));
          })
        }
      />
    </NavbarFormGroup>
  );

  // The meter field changes the time signature of the transport
  const [TS1, setTS1] = useState(timeSignature ? timeSignature[0] : 16);
  const MeterField = (
    <NavbarFormGroup>
      <NavbarSettingsLabel>Meter (out of 16)</NavbarSettingsLabel>
      <NavbarFormInput
        className="focus:bg-slate-900/25 max-w-16 h-7"
        type="number"
        placeholder={"16"}
        value={TS1}
        onChange={(e) => setTS1(e.target.valueAsNumber)}
        onKeyDown={(e) =>
          onEnter(e, () => {
            if (isNaN(TS1)) return;
            const newValue = clamp(TS1, 1, 64);
            setTS1(newValue);
            dispatch(setTransportTimeSignature([newValue, 16]));
          })
        }
      />
    </NavbarFormGroup>
  );

  // The zoom field changes the width of a timeline cell
  const [ZoomInput, setZoomInput] = useState(cellWidth);
  const ZoomField = (
    <NavbarFormGroup>
      <NavbarSettingsLabel>Zoom (0-10)</NavbarSettingsLabel>
      <NavbarFormInput
        className="focus:bg-slate-800/25 max-w-16 h-7"
        type="number"
        placeholder={"1"}
        value={percent(ZoomInput, MIN_CELL_WIDTH, MAX_CELL_WIDTH) / 10}
        onChange={(e) =>
          setZoomInput((prev) => {
            if (isNaN(e.target.valueAsNumber)) return prev;
            const percentInRange = percent(e.target.valueAsNumber, 0, 10) / 100;
            const actualRange = MAX_CELL_WIDTH - MIN_CELL_WIDTH;
            const width = percentInRange * actualRange + MIN_CELL_WIDTH;
            return width ?? DEFAULT_CELL_WIDTH;
          })
        }
        onKeyDown={(e) =>
          onEnter(e, () => {
            if (isNaN(ZoomInput)) return;
            dispatch(setCellWidth(ZoomInput));
            setZoomInput(clamp(ZoomInput, MIN_CELL_WIDTH, MAX_CELL_WIDTH));
          })
        }
      />
    </NavbarFormGroup>
  );

  // The performance toggle changes the visibility of the timeline
  const PerformanceToggle = (
    <NavbarFormGroup>
      <NavbarSettingsLabel>Timeline</NavbarSettingsLabel>
      <NavbarFormButton
        className={classNames(
          `hover:opacity-95 active:opacity-100 w-24`,
          hideTimeline ? "bg-red-500/30" : "bg-emerald-500/30"
        )}
        onClick={() => dispatch(toggleTimeline())}
      >
        {hideTimeline ? "Hidden" : "Visible"}
      </NavbarFormButton>
    </NavbarFormGroup>
  );

  // The tooltip toggle changes the visibility of tooltips
  const TooltipToggle = (
    <NavbarFormGroup>
      <NavbarSettingsLabel>Tooltips</NavbarSettingsLabel>
      <NavbarFormButton
        className={classNames(
          `hover:opacity-95 active:opacity-100 w-24`,
          hideTooltips ? "bg-red-500/30" : "bg-emerald-500/30"
        )}
        onClick={() => dispatch(toggleTooltips())}
      >
        {hideTooltips ? "Disabled" : "Enabled"}
      </NavbarFormButton>
    </NavbarFormGroup>
  );

  // The shortcuts button opens the shortcuts menu
  const ShortcutsButton = (
    <NavbarFormGroup>
      <NavbarFormButton
        className={`w-full hover:bg-slate-600/50 active:bg-slate-800/50`}
        onClick={() => dispatchCustomEvent(TOGGLE_STATE("shortcuts"))}
      >
        Open Shortcut Menu
      </NavbarFormButton>
    </NavbarFormGroup>
  );

  return (
    <div className="group relative">
      {/* Button */}
      <div
        className={classNames(
          "rounded-full p-1.5 border-0 select-none cursor-pointer group-hover:text-slate-400 hover:shadow-xl"
        )}
      >
        <GiSettingsKnobs />
      </div>
      {/* Tooltip */}
      <NavbarHoverTooltip bgColor="bg-slate-800/90 backdrop-blur">
        <div className="size-full py-1 space-y-3">
          {BPMField}
          {MeterField}
          {ZoomField}
          {PerformanceToggle}
          {TooltipToggle}
          {ShortcutsButton}
        </div>
      </NavbarHoverTooltip>
    </div>
  );
}

function NavbarSettingsLabel({ children }: { children: React.ReactNode }) {
  return (
    <NavbarFormLabel className="w-24 hover:opacity-95 active:opacity-100 whitespace-nowrap">
      {children}
    </NavbarFormLabel>
  );
}

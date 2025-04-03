import { DEFAULT_BPM, MIN_BPM, MAX_BPM } from "utils/constants";
import { useDeep, useProjectDispatch } from "types/hooks";
import classNames from "classnames";
import {
  GiBookCover,
  GiCog,
  GiForest,
  GiStethoscope,
  GiWireframeGlobe,
} from "react-icons/gi";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";
import {
  setTransportBPM,
  setTransportTimeSignature,
} from "types/Transport/TransportThunks";
import { selectHideTimeline } from "types/Meta/MetaSelectors";
import { toggleTimeline } from "types/Meta/MetaSlice";
import {
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { useTerminal } from "types/Project/ProjectTypes";
import { NavbarFileGroup, NavbarFileLabel } from "./NavbarProject";
import { BsFillTerminalFill } from "react-icons/bs";
import { toggleCellWidth } from "types/Timeline/TimelineThunks";
import { SyncedNumericalForm } from "components/SyncedForm";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { useToggledState } from "hooks/useToggledState";

export function NavbarSettings() {
  const dispatch = useProjectDispatch();
  const Terminal = useTerminal();
  const Diary = useToggledState("diary");
  const bpm = useDeep(selectTransportBPM);
  const [meter] = useDeep(selectTransportTimeSignature);
  const hasTracks = useDeep(selectHasTracks);
  const hideTimeline = useDeep(selectHideTimeline);
  return (
    <div className="group/tooltip relative">
      {/* Button */}
      <div
        className={classNames(
          "rounded-full p-1.5 text-2xl border-0 select-none cursor-pointer group-hover/tooltip:text-slate-400 hover:shadow-xl"
        )}
      >
        <GiCog />
      </div>
      {/* Tooltip */}
      <NavbarHoverTooltip
        className="min-w-64 -left-16"
        bgColor="bg-slate-900/80 backdrop-blur"
      >
        <div className="size-full py-1 space-y-3">
          <NavbarFormGroup>
            <NavbarSettingsLabel>Tempo (BPM)</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={bpm}
              setValue={(v) => dispatch(setTransportBPM(v))}
              min={MIN_BPM}
              max={MAX_BPM}
              placeholder={DEFAULT_BPM.toString()}
            />
          </NavbarFormGroup>

          <NavbarFormGroup>
            <NavbarSettingsLabel>16ths per Bar</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={meter}
              setValue={(v) => dispatch(setTransportTimeSignature([v, 16]))}
              min={1}
              max={64}
              placeholder={"16"}
            />
          </NavbarFormGroup>

          <NavbarFileGroup
            className="last:*:ml-auto last:*:text-2xl"
            onClick={() => dispatch(toggleTimeline())}
          >
            <NavbarFileLabel>
              {hideTimeline ? "Return to Timeline" : "Go To Forest"}
            </NavbarFileLabel>
            {!hideTimeline ? <GiForest /> : <GiWireframeGlobe />}
          </NavbarFileGroup>

          <NavbarFileGroup onClick={Terminal.toggle}>
            <NavbarFileLabel>Open Terminal</NavbarFileLabel>
            <BsFillTerminalFill className="ml-auto text-2xl" />
          </NavbarFileGroup>

          <NavbarFileGroup onClick={Diary.toggle}>
            <NavbarFileLabel>Open Diary</NavbarFileLabel>
            <GiBookCover className="ml-auto text-2xl" />
          </NavbarFileGroup>
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

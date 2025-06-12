import { DEFAULT_BPM, MIN_BPM, MAX_BPM } from "utils/constants";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import classNames from "classnames";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  NavbarFormGroup,
  NavbarFormLabel,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { NavbarFileGroup, NavbarFileLabel } from "./NavbarProject";
import { BsQuestionCircle, BsTerminal } from "react-icons/bs";
import { SyncedNumericalForm } from "components/SyncedForm";
import { useToggle } from "hooks/useToggle";
import {
  setBPM,
  setTimeSignature,
  setSwing,
  setScroll,
} from "types/Transport/TransportSlice";
import { GiCog } from "react-icons/gi";

export function NavbarSettings() {
  const dispatch = useAppDispatch();
  const Terminal = useToggle("terminal");
  const Shortcuts = useToggle("shortcuts");
  const { bpm, timeSignature, swing, scroll } = useAppValue(selectTransport);
  return (
    <div className="group/tooltip relative">
      {/* Button */}
      <div
        className={classNames(
          "rounded-full p-1.5 size-9 total-center text-2xl border border-slate-400 select-none cursor-pointer group-hover/tooltip:text-slate-500 hover:shadow-xl"
        )}
      >
        <GiCog />
      </div>
      {/* Tooltip */}
      <NavbarHoverTooltip
        className="min-w-64 -left-16"
        bgColor="bg-radial from-slate-900 to-zinc-900"
      >
        <div className="size-full py-1 space-y-3">
          <NavbarFormGroup>
            <NavbarSettingsLabel>Beats per Minute</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={bpm}
              setValue={(v) => dispatch(setBPM(v))}
              min={MIN_BPM}
              max={MAX_BPM}
              placeholder={DEFAULT_BPM.toString()}
            />
          </NavbarFormGroup>

          <NavbarFormGroup>
            <NavbarSettingsLabel>Quarters per Bar</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={timeSignature}
              setValue={(v) => dispatch(setTimeSignature(v))}
              min={1}
              max={64}
              placeholder={"4"}
            />
          </NavbarFormGroup>

          <NavbarFormGroup>
            <NavbarSettingsLabel>Swing Ratio (0-1)</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={swing}
              setValue={(v) => dispatch(setSwing(v))}
              min={0}
              max={1}
              placeholder={"0-1"}
            />
          </NavbarFormGroup>
          <NavbarFormGroup>
            <NavbarSettingsLabel>Scroll Interval (Bars)</NavbarSettingsLabel>
            <SyncedNumericalForm
              className="block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-400 focus:ring-slate-300 appearance-none focus:bg-slate-900/25 max-w-16 h-7"
              value={scroll}
              setValue={(v) => dispatch(setScroll(v))}
              min={0}
              max={Infinity}
              defaultNumber={0}
              placeholder={"0"}
            />
          </NavbarFormGroup>
          <NavbarFileGroup onClick={Terminal.toggle}>
            <NavbarFileLabel>
              {Terminal.isOpen ? "Close" : "Open"} Terminal
            </NavbarFileLabel>
            <BsTerminal className="ml-auto text-2xl" />
          </NavbarFileGroup>
          <NavbarFileGroup onClick={Shortcuts.toggle}>
            <NavbarFileLabel>View Shortcuts</NavbarFileLabel>
            <BsQuestionCircle className="ml-auto text-2xl" />
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

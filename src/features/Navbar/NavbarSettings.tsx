import { DEFAULT_BPM, MIN_BPM, MAX_BPM } from "utils/constants";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarTitleForm,
} from "features/Navbar/components/NavbarForm";
import { NavbarHoverTooltip } from "features/Navbar/components/NavbarTooltip";
import { NavbarFileGroup, NavbarFileLabel } from "./NavbarProject";
import {
  BsGlobe,
  BsQuestionCircle,
  BsSignIntersection,
  BsTerminal,
} from "react-icons/bs";
import { SyncedNumericalForm } from "components/SyncedForm";
import { useToggle } from "hooks/useToggle";
import {
  setBPM,
  setTimeSignature,
  setSwing,
  setScroll,
} from "types/Transport/TransportSlice";
import { GiCog } from "react-icons/gi";
import { ToggleCollabHotkey } from "lib/hotkeys/global";
import { isLocal } from "app/listener";

export function NavbarSettings() {
  const dispatch = useAppDispatch();
  const Terminal = useToggle("terminal");
  const Shortcuts = useToggle("shortcuts");
  const { bpm, timeSignature, swing, scroll } = useAppValue(selectTransport);
  return (
    <div className="group/tooltip relative">
      {/* Button */}
      <div className="rounded-full p-1.5 size-9 total-center text-2xl select-none cursor-pointer group-hover/tooltip:text-slate-500 hover:shadow-xl">
        <GiCog />
      </div>
      {/* Tooltip */}
      <NavbarHoverTooltip
        className="min-w-64 -left-16"
        bgColor="bg-radial from-slate-900 to-zinc-900"
        borderColor="border-slate-400"
      >
        <div className="size-full py-1 space-y-3 min-w-48">
          <NavbarTitleForm value="Project Settings" />

          <NavbarFormGroup>
            <NavbarSettingsLabel>Beats per Minute</NavbarSettingsLabel>
            <SyncedNumericalForm
              className={formClass}
              value={bpm}
              setValue={(v) => dispatch(setBPM(v))}
              min={MIN_BPM}
              max={MAX_BPM}
              placeholder={DEFAULT_BPM.toString()}
            />
          </NavbarFormGroup>

          <NavbarFormGroup>
            <NavbarSettingsLabel>Beats per Bar</NavbarSettingsLabel>
            <SyncedNumericalForm
              className={formClass}
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
              className={formClass}
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
              className={formClass}
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
            <NavbarFileLabel>Open Shortcuts</NavbarFileLabel>
            <BsQuestionCircle className="ml-auto text-2xl" />
          </NavbarFileGroup>
          {isLocal() && (
            <NavbarFileGroup
              onClick={(e) =>
                ToggleCollabHotkey.callback(dispatch, e.nativeEvent)
              }
            >
              <NavbarFileLabel>Open Connection</NavbarFileLabel>
              <BsSignIntersection className="ml-auto text-2xl" />
            </NavbarFileGroup>
          )}
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

const formClass =
  "block flex-auto px-2 bg-transparent rounded-md text-sm focus:outline-none text-white disabled:text-slate-400 disabled:placeholder-slate-400 placeholder-slate-300 border-0 focus:border-0 ring-1 ring-slate-500 focus:ring-slate-300 appearance-none focus:bg-slate-950/50 max-w-16 h-7";

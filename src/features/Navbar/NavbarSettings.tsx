import {
  MIN_TRANSPORT_VOLUME,
  MAX_TRANSPORT_VOLUME,
  MIN_CELL_WIDTH,
  MAX_CELL_WIDTH,
  DEFAULT_BPM,
} from "utils/constants";
import { KeyboardEvent, useState } from "react";
import {
  BsGearFill,
  BsVolumeDownFill,
  BsVolumeMuteFill,
  BsVolumeOffFill,
  BsVolumeUpFill,
} from "react-icons/bs";
import { clamp } from "lodash";
import { DEFAULT_CELL } from "types/Timeline";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarFormButton,
  NavbarTooltipMenu,
  NavbarButton,
} from "./components";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import {
  selectTransport,
  setTransportBPM,
  setTransportTimeSignature,
  setTransportVolume,
  toggleTransportMute,
} from "redux/Transport";
import { selectCell, setCellWidth } from "redux/Timeline";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { TOGGLE_SHORTCUTS } from "features/Shortcuts";
import { dispatchCustomEvent } from "utils/html";

export function NavbarSettingsMenu() {
  const dispatch = useProjectDispatch();
  const { bpm, timeSignature, volume, mute } =
    useProjectSelector(selectTransport);
  const cell = useProjectSelector(selectCell);

  // Settings visibility toggle
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow((prev) => !prev);
  useOverridingHotkeys("meta+,", toggleShow, { splitKey: ";" });

  /**
   * The Settings button is rendered as a gear icon.
   * Clicking the button toggles the visibility of the tooltip menu.
   */
  const SettingsButton = () => {
    const className = `cursor-pointer mr-1 ${
      show ? "text-slate-500 drop-shadow-xl rounded-full " : ""
    }`;
    return (
      <NavbarButton className={className}>
        <BsGearFill onClick={() => setShow(!show)} />
      </NavbarButton>
    );
  };

  // BPM field for non-immediate changes
  const [BPMInput, setBPMInput] = useState(bpm);
  const onBPMKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !!e.currentTarget.value) {
      dispatch(setTransportBPM(e.currentTarget.valueAsNumber));
    }
  };
  const BPMField = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32 font-light after:[`s`]">
        Tempo (BPM):
      </NavbarFormLabel>
      <NavbarFormInput
        className="focus:bg-slate-900/25 w-[2rem] h-7"
        type="number"
        placeholder={DEFAULT_BPM.toString()}
        value={BPMInput}
        onChange={(e) => setBPMInput(e.target.valueAsNumber)}
        onKeyDown={onBPMKeyDown}
      />
    </NavbarFormGroup>
  );

  // Time signature field for non-immediate changes
  const [TS1, setTS1] = useState(timeSignature ? timeSignature[0] : 16);
  const TS2 = 16;
  const onTSKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isNaN(TS1) && !isNaN(TS2)) {
      dispatch(setTransportTimeSignature([TS1, TS2]));
    }
  };
  const TimeSignatureField = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32 font-light after:[`s`]">
        16ths / Measure:
      </NavbarFormLabel>
      <NavbarFormInput
        className="focus:bg-slate-900/25 w-[2rem] h-7"
        type="number"
        placeholder={"16"}
        value={TS1}
        onChange={(e) => setTS1(e.target.valueAsNumber)}
        onKeyDown={onTSKeyDown}
      />
    </NavbarFormGroup>
  );

  // Cell field for non-immediate changes
  const [CellInput, setCellInput] = useState(cell);
  const setInputWidth = (width: number) =>
    setCellInput((prev) => ({ ...prev, width: width ?? DEFAULT_CELL.width }));
  const onWidthKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isNaN(CellInput.width)) {
      dispatch(setCellWidth(CellInput.width));
      setCellInput({
        ...cell,
        width: clamp(CellInput.width, MIN_CELL_WIDTH, MAX_CELL_WIDTH),
      });
    }
  };
  const CellWidthField = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32 font-light">Cell Width:</NavbarFormLabel>
      <NavbarFormInput
        className="focus:bg-slate-900/25 w-[2rem] h-7"
        type="number"
        placeholder={DEFAULT_CELL.width.toString()}
        value={CellInput.width}
        onChange={(e) => setInputWidth(e.target.valueAsNumber)}
        onKeyDown={onWidthKeyDown}
      />
    </NavbarFormGroup>
  );

  /**
   * The Shortcuts button opens the shortcuts menu.
   */
  const ShortcutsButton = () => (
    <NavbarFormGroup className="pt-2">
      <NavbarFormButton
        className={`hover:bg-slate-600/50 active:bg-slate-800/50 w-12`}
        onClick={() => dispatchCustomEvent(TOGGLE_SHORTCUTS)}
      >
        Open Shortcuts Menu
      </NavbarFormButton>
    </NavbarFormGroup>
  );

  /**
   * The Settings Tooltip content allows the user to
   * change the tempo, time signature, and cell width,
   * as well as open the shortcuts menu.
   */
  const SettingsTooltipContent = () => (
    <NavbarTooltipMenu>
      <div className="pb-2 mb-1 w-full text-center font-bold border-b">
        Project Settings
      </div>
      <div className="w-full h-full py-2 space-y-2">
        {BPMField()}
        {TimeSignatureField()}
        {CellWidthField()}
        <ShortcutsButton />
      </div>
    </NavbarTooltipMenu>
  );

  const [draggingVolume, setDraggingVolume] = useState(false);

  /**
   * The transport volume icon dynamically changes based on the volume.
   * Clicking the icon toggles the transport mute.
   */
  const TransportVolumeIcon = () => {
    const VolumeIcon = mute ? (
      <BsVolumeMuteFill />
    ) : volume > -20 ? (
      <BsVolumeUpFill />
    ) : volume > -40 ? (
      <BsVolumeDownFill />
    ) : (
      <BsVolumeOffFill />
    );
    return (
      <div
        className="mr-2 cursor-pointer relative xl:text-3xl text-xl"
        onClick={() => dispatch(toggleTransportMute())}
      >
        {VolumeIcon}
        {draggingVolume ? (
          <label
            className={`mt-1.5 text-xs select-none absolute bg-slate-800/80 backdrop-blur p-1 px-2 rounded border border-slate-500`}
          >
            {volume}dB
          </label>
        ) : null}
      </div>
    );
  };

  /**
   * The transport volume slider is rendered as a range slider.
   */
  const TransportVolumeSlider = () => (
    <input
      className="w-24 accent-white caret-slate-50 mr-4"
      type="range"
      value={mute ? MIN_TRANSPORT_VOLUME : volume}
      min={MIN_TRANSPORT_VOLUME}
      max={MAX_TRANSPORT_VOLUME}
      onChange={(e) => dispatch(setTransportVolume(parseInt(e.target.value)))}
      onMouseDown={() => {
        setDraggingVolume(true);
        if (mute) dispatch(toggleTransportMute());
      }}
      onMouseUp={() => setDraggingVolume(false)}
    />
  );

  /**
   * The transport volume field consists of the volume icon and slider.
   */
  const TransportVolumeField = () => (
    <>
      {TransportVolumeIcon()}
      {TransportVolumeSlider()}
    </>
  );

  return (
    <>
      {TransportVolumeField()}
      <div className="flex items-center">
        <SettingsButton />
        <NavbarTooltip
          className="-left-[1rem] w-56 bg-slate-700/90 backdrop-blur"
          content={SettingsTooltipContent}
          show={show}
        />
      </div>
    </>
  );
}

import {
  MIN_TRANSPORT_VOLUME,
  MAX_TRANSPORT_VOLUME,
  MIN_CELL_WIDTH,
  MAX_CELL_WIDTH,
  DEFAULT_BPM,
} from "appConstants";
import { KeyboardEvent, useMemo, useState } from "react";
import { BsGearFill, BsVolumeDownFill, BsVolumeMuteFill } from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { selectCell, selectTransport } from "redux/selectors";
import {
  setTransportBPM,
  setTransportMute,
  setTransportTimeSignature,
  setTransportVolume,
} from "redux/Transport";
import { AppDispatch, RootState } from "redux/store";
import { BPM, Volume } from "types/units";
import { NavbarTooltip } from "./Navbar";
import { NavbarFormGroup } from "./Navbar";
import { NavbarFormLabel } from "./Navbar";
import { NavbarFormInput } from "./Navbar";
import { toggleShortcuts } from "redux/Root";
import { clamp } from "lodash";
import { setCellWidth, setCellHeight } from "redux/Timeline";
import { DEFAULT_CELL } from "types/Timeline";
import { useHotkeys } from "react-hotkeys-hook";

const mapStateToProps = (state: RootState) => {
  const { bpm, timeSignature, volume, mute } = selectTransport(state);

  const cell = selectCell(state);
  return { bpm, timeSignature, volume, mute, cell };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setBPM(bpm: BPM) {
      dispatch(setTransportBPM(bpm));
    },
    setTimeSignature([TS1, TS2]: [number, number]) {
      dispatch(setTransportTimeSignature([TS1, TS2]));
    },
    setVolume: (volume: Volume) => {
      dispatch(setTransportVolume(volume));
    },
    setMute: (mute: boolean) => {
      dispatch(setTransportMute(mute));
    },
    setCellWidth: (cellWidth: number) => {
      dispatch(setCellWidth(cellWidth));
    },
    setCellHeight: (cellHeight: number) => {
      dispatch(setCellHeight(cellHeight));
    },
    toggleShortcuts: () => {
      dispatch(toggleShortcuts());
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Settings);

function Settings(props: Props) {
  const { bpm, timeSignature, volume, setVolume, cell } = props;

  // BPM properties
  const [BPMInput, setBPMInput] = useState(bpm);
  const onBPMKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !!e.currentTarget.value) {
      props.setBPM(e.currentTarget.valueAsNumber);
    }
  };

  // Time signature properties
  const [TS1, setTS1] = useState(timeSignature ? timeSignature[0] : 16);
  const TS2 = 16;

  const onTSKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isNaN(TS1) && !isNaN(TS2)) {
      props.setTimeSignature([TS1, TS2]);
    }
  };

  // Cell properties
  const [CellInput, setCellInput] = useState(cell);
  const setCellWidth = (width: number) =>
    setCellInput((prev) => ({ ...prev, width: width ?? DEFAULT_CELL.width }));

  const onWidthKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isNaN(CellInput.width)) {
      props.setCellWidth(CellInput.width);
      setCellInput({
        ...cell,
        width: clamp(CellInput.width, MIN_CELL_WIDTH, MAX_CELL_WIDTH),
      });
    }
  };

  // Settings visibility toggle
  const [show, setShow] = useState(false);
  useHotkeys(
    "meta+,",
    () => setShow(!show),
    { preventDefault: true, splitKey: ";" },
    [show]
  );

  const SettingsTooltipContent = useMemo(
    () => (
      <>
        <div className="flex flex-col justify-center items-center p-2">
          <NavbarFormGroup>
            <NavbarFormLabel className="font-bold w-36 mr-3">
              Tempo (BPM)
            </NavbarFormLabel>
            <NavbarFormInput
              className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
              type="number"
              placeholder={DEFAULT_BPM.toString()}
              value={BPMInput}
              onChange={(e) => setBPMInput(e.target.valueAsNumber)}
              onKeyDown={onBPMKeyDown}
            />
          </NavbarFormGroup>
          <NavbarFormGroup>
            <NavbarFormLabel className="w-36 mr-3">
              16ths / Measure
            </NavbarFormLabel>
            <NavbarFormInput
              className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
              type="number"
              placeholder={"16"}
              value={TS1}
              onChange={(e) => setTS1(e.target.valueAsNumber)}
              onKeyDown={onTSKeyDown}
            />
          </NavbarFormGroup>
          <NavbarFormGroup>
            <NavbarFormLabel className="w-36 mr-3">Cell Width</NavbarFormLabel>
            <NavbarFormInput
              className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
              type="number"
              placeholder={DEFAULT_CELL.width.toString()}
              value={CellInput.width}
              onChange={(e) => setCellWidth(e.target.valueAsNumber)}
              onKeyDown={onWidthKeyDown}
            />
          </NavbarFormGroup>
          <NavbarFormGroup
            className="border border-slate-400 rounded-lg mt-2 py-2 hover:bg-slate-600/50 active:bg-slate-800/50"
            onClick={props.toggleShortcuts}
          >
            Open Shortcuts Menu
          </NavbarFormGroup>
        </div>
      </>
    ),
    [BPMInput, TS1, CellInput, props.toggleShortcuts]
  );

  const [draggingVolume, setDraggingVolume] = useState(false);

  const VolumeIcon = () => (
    <div
      className="mr-2 cursor-pointer relative"
      onClick={() => props.setMute(!props.mute)}
    >
      {props.mute ? (
        <BsVolumeMuteFill className="text-3xl" />
      ) : (
        <BsVolumeDownFill className="text-3xl" />
      )}
      {draggingVolume ? (
        <label
          className={`mt-1.5 text-xs select-none absolute bg-slate-800/80 backdrop-blur p-1 px-2 rounded border border-slate-500`}
        >
          {props.volume}dB
        </label>
      ) : null}
    </div>
  );

  return (
    <>
      <VolumeIcon />
      <input
        className="w-24 accent-white caret-slate-50 mr-4"
        type="range"
        value={props.mute ? MIN_TRANSPORT_VOLUME : volume}
        min={MIN_TRANSPORT_VOLUME}
        max={MAX_TRANSPORT_VOLUME}
        onChange={(e) => setVolume(parseInt(e.target.value))}
        onMouseDown={() => {
          setDraggingVolume(true);
          if (props.mute) props.setMute(false);
        }}
        onMouseUp={() => setDraggingVolume(false)}
      />
      <BsGearFill
        className={`text-2xl cursor-pointer mr-2 ${
          show
            ? "text-slate-500 drop-shadow-xl rounded-full ring-2 ring-offset-4 ring-slate-500 ring-offset-gray-900"
            : ""
        }`}
        onClick={() => setShow(!show)}
      />
      <NavbarTooltip
        className="bg-slate-700/90 backdrop-blur"
        content={SettingsTooltipContent}
        show={show}
      />
    </>
  );
}

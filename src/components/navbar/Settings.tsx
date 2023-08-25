import {
  MIN_GLOBAL_VOLUME,
  MAX_GLOBAL_VOLUME,
  MIN_CELL_WIDTH,
  MAX_CELL_WIDTH,
} from "appConstants";
import { useContext, useState } from "react";
import {
  BsCheck,
  BsGearFill,
  BsVolumeDownFill,
  BsVolumeMuteFill,
} from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { selectCellWidth, selectTransport } from "redux/selectors";
import {
  setTransportBPM,
  setTransportMute,
  setTransportTimeSignature,
  setTransportVolume,
} from "redux/thunks/transport";
import { AppDispatch, RootState } from "redux/store";
import { BPM, Volume } from "types/units";
import { NavbarTooltip } from "./Navbar";
import { NavbarFormGroup } from "./Navbar";
import { NavbarFormLabel } from "./Navbar";
import { NavbarFormInput } from "./Navbar";
import { setCellWidth, showShortcuts } from "redux/slices/root";
import { clamp } from "lodash";
import useEventListeners from "hooks/useEventListeners";
import { isHoldingCommand, isInputEvent } from "appUtil";

const mapStateToProps = (state: RootState) => {
  const { bpm, timeSignature, volume, mute } = selectTransport(state);
  const cellWidth = selectCellWidth(state);
  return { bpm, timeSignature, volume, mute, cellWidth };
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
      if (volume < MIN_GLOBAL_VOLUME || volume > MAX_GLOBAL_VOLUME) return;
      dispatch(setTransportVolume(volume));
    },
    setMute: (mute: boolean) => {
      dispatch(setTransportMute(mute));
    },
    setCellWidth: (cellWidth: number) => {
      dispatch(setCellWidth(cellWidth));
    },
    showShortcuts: () => {
      dispatch(showShortcuts());
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Settings);

function Settings(props: Props) {
  const { bpm, timeSignature, volume, setVolume, cellWidth } = props;
  const [BPMInput, setBPMInput] = useState(bpm);
  const [widthInput, setWidthInput] = useState(cellWidth / 25);
  const [TS1, setTS1] = useState(timeSignature ? timeSignature[0] : 16);
  const TS2 = 16;

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };
  const onBPMKeyDown = (e: any) => {
    if (e.key === "Enter" && !!e.currentTarget.value) {
      props.setBPM(e.currentTarget.value);
    }
  };
  const onTSKeyDown = (e: any) => {
    if (e.key === "Enter" && !isNaN(TS1) && !isNaN(TS2)) {
      props.setTimeSignature([TS1, TS2]);
    }
  };
  const onWidthKeyDown = (e: any) => {
    if (e.key === "Enter" && !isNaN(widthInput)) {
      props.setCellWidth(widthInput * 25);
      setWidthInput(clamp(widthInput, 1, 2));
    }
  };

  const [show, setShow] = useState(false);
  useEventListeners(
    {
      // Command + , = Toggle Settings
      ",": {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          e.preventDefault();
          setShow(!show);
        },
      },
    },
    [show, setShow]
  );

  const SettingsTooltipContent = () => (
    <>
      <div className="flex flex-col justify-center items-center p-2">
        <NavbarFormGroup>
          <NavbarFormLabel className="font-bold w-36 mr-3">
            Tempo (BPM)
          </NavbarFormLabel>
          <NavbarFormInput
            className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
            type="number"
            value={BPMInput}
            onChange={(e: any) => setBPMInput(parseInt(e.target.value))}
            onKeyDown={(e: any) => {
              onKeyDown(e);
              onBPMKeyDown(e);
            }}
          />
        </NavbarFormGroup>
        <NavbarFormGroup className="my-2">
          <NavbarFormLabel className="w-36 mr-3">
            16ths / Measure
          </NavbarFormLabel>
          <NavbarFormInput
            className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
            type="number"
            value={TS1}
            onChange={(e: any) => setTS1(parseInt(e.target.value))}
            onKeyDown={(e: any) => {
              onKeyDown(e);
              onTSKeyDown(e);
            }}
          />
        </NavbarFormGroup>
        <NavbarFormGroup>
          <NavbarFormLabel className="w-36 mr-3">Zoom (1 - 2)</NavbarFormLabel>
          <NavbarFormInput
            className="w-16 text-gray-300 focus:text-gray-50 focus:bg-slate-900/25 border-slate-400 focus:border-slate-300"
            type="number"
            value={widthInput}
            min={1}
            max={2}
            onChange={(e: any) => setWidthInput(parseFloat(e.target.value))}
            onKeyDown={(e: any) => {
              onKeyDown(e);
              onWidthKeyDown(e);
            }}
          />
        </NavbarFormGroup>
        <NavbarFormGroup
          className="border rounded-lg mt-4 py-2 hover:bg-slate-600/50 active:bg-slate-800/50"
          onClick={props.showShortcuts}
        >
          Open Shortcuts Menu
        </NavbarFormGroup>
      </div>
    </>
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
        <label className="text-xs select-none absolute bg-slate-800/80 backdrop-blur p-1 rounded">
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
        value={props.mute ? MIN_GLOBAL_VOLUME : volume}
        min={MIN_GLOBAL_VOLUME}
        max={MAX_GLOBAL_VOLUME}
        onChange={(e: any) => setVolume(parseInt(e.target.value))}
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
        className="bg-slate-700/70 backdrop-blur"
        content={SettingsTooltipContent}
        show={show}
      />
    </>
  );
}

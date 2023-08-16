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
import { MIDIContext } from "providers/midi";
import { Listbox, Transition } from "@headlessui/react";
import { setCellWidth } from "redux/slices/root";
import { clamp } from "lodash";

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
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Settings);

function Settings(props: Props) {
  const { bpm, timeSignature, volume, setVolume, cellWidth } = props;
  const MIDIProvider = useContext(MIDIContext);
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
  const SettingsTooltipContent = () => (
    <>
      <div className="flex justify-center items-center py-2">
        <NavbarFormGroup className="flex flex-col w-[8rem]">
          <NavbarFormLabel className="mb-2 mx-auto font-semibold">
            Tempo (BPM)
          </NavbarFormLabel>
          <NavbarFormInput
            className="w-20 mx-auto text-gray-300 focus:text-gray-50"
            type="number"
            value={BPMInput}
            onChange={(e: any) => setBPMInput(parseInt(e.target.value))}
            onKeyDown={(e: any) => {
              onKeyDown(e);
              onBPMKeyDown(e);
            }}
          />
        </NavbarFormGroup>
        <NavbarFormGroup className="flex flex-col w-[8rem]">
          <NavbarFormLabel className="mb-2 mx-auto font-semibold">
            Time Signature
          </NavbarFormLabel>
          <div className="flex">
            <NavbarFormInput
              className="w-12 mr-1 text-gray-300 focus:text-gray-50"
              type="number"
              value={TS1}
              onChange={(e: any) => setTS1(parseInt(e.target.value))}
              onKeyDown={(e: any) => {
                onKeyDown(e);
                onTSKeyDown(e);
              }}
            />
            <NavbarFormInput
              className="w-12 ml-1 text-stone-50"
              disabled
              type="number"
              value={TS2}
            />
          </div>
        </NavbarFormGroup>
      </div>
      <div className="flex justify-center items-center py-2">
        <NavbarFormGroup className="flex flex-col w-[8rem]">
          <NavbarFormLabel className="mb-2 mx-auto font-semibold">
            MIDI Input
          </NavbarFormLabel>
          {/* MIDI Input Listbox */}
          <Listbox
            value={MIDIProvider.selectedInput}
            onChange={(input) => MIDIProvider.setSelectedInput(input)}
          >
            {({ open }) => (
              <div className="relative">
                <Listbox.Button className="border border-slate-300 rounded-md mx-2">
                  <NavbarFormInput
                    className="w-full focus:text-gray-50 text-ellipsis"
                    value={MIDIProvider.selectedInput?.name || "None"}
                    disabled
                  />
                </Listbox.Button>
                <Transition
                  show={open}
                  enter="transition ease-out duration-75"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Listbox.Options className="absolute z-10 w-auto my-2 py-1 px-2 border border-white/50 text-base bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {MIDIProvider.midiInputs.map((input) => (
                      <Listbox.Option
                        key={input.id}
                        value={input}
                        className="hover:bg-slate-500/80 rounded cursor-pointer"
                        onClick={() => MIDIProvider.setSelectedInput(input)}
                      >
                        {({ selected, active }) => (
                          <div
                            className={
                              selected
                                ? "text-white"
                                : active
                                ? "text-white"
                                : "text-gray-400"
                            }
                          >
                            {selected ? <BsCheck className="inline" /> : null}{" "}
                            {input.name}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>
        </NavbarFormGroup>
        <NavbarFormGroup className="flex flex-col w-[8rem]">
          <NavbarFormLabel className="mb-2 mx-auto font-semibold">
            Cell Scale
          </NavbarFormLabel>
          <NavbarFormInput
            className="w-20 mx-auto text-gray-300 focus:text-gray-50"
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

  const VolumeSlider = () => (
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
  );

  return (
    <>
      <VolumeIcon />
      <VolumeSlider />
      <BsGearFill
        className="text-2xl cursor-pointer mr-2"
        onClick={() => setShow(!show)}
      />
      <NavbarTooltip
        className="bg-slate-800/90 backdrop-blur-sm"
        content={SettingsTooltipContent}
        show={show}
      />
    </>
  );
}

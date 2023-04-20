import { MIN_GLOBAL_VOLUME, MAX_GLOBAL_VOLUME } from "appConstants";
import { useState } from "react";
import { BsGearFill, BsVolumeDownFill } from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { setTransportBPM, setTransportVolume } from "redux/slices/transport";
import { AppDispatch, RootState } from "redux/store";
import { BPM, Volume } from "types/units";
import { NavbarTooltip } from "./Navbar";
import { NavbarFormGroup } from "./Navbar";
import { NavbarFormLabel } from "./Navbar";
import { NavbarFormInput } from "./Navbar";

const mapStateToProps = (state: RootState) => {
  const { bpm, volume } = selectTransport(state);
  return { bpm, volume };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setBPM(bpm: BPM) {
      dispatch(setTransportBPM(bpm));
    },
    setVolume: (volume: Volume) => {
      if (volume < MIN_GLOBAL_VOLUME || volume > MAX_GLOBAL_VOLUME) return;
      dispatch(setTransportVolume(volume));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Settings);

function Settings(props: Props) {
  const { bpm, volume, setVolume } = props;
  const [BPMInput, setBPMInput] = useState(bpm);

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };
  const onBPMKeyDown = (e: any) => {
    if (e.key === "Enter" && !isNaN(parseInt(e.currentTarget.value))) {
      props.setBPM(parseInt(e.currentTarget.value));
      e.currentTarget.blur();
    }
  };

  const [show, setShow] = useState(false);
  const SettingsTooltipContent = () => (
    <div className="flex flex-col justify-center items-center">
      <NavbarFormGroup>
        <NavbarFormLabel>BPM</NavbarFormLabel>
        <NavbarFormInput
          className="w-16"
          type="number"
          value={BPMInput}
          onChange={(e: any) => setBPMInput(parseInt(e.target.value))}
          onKeyDown={(e: any) => {
            onKeyDown(e);
            onBPMKeyDown(e);
          }}
        />
      </NavbarFormGroup>
    </div>
  );

  return (
    <>
      <BsVolumeDownFill className="text-4xl mr-2" />
      <input
        className="w-24 accent-white caret-slate-50 mr-4"
        type="range"
        value={volume}
        min={MIN_GLOBAL_VOLUME}
        max={0}
        onChange={(e: any) => setVolume(parseInt(e.target.value))}
      />
      <BsGearFill
        className="text-2xl cursor-pointer mr-2"
        onClick={() => setShow(!show)}
      />
      <NavbarTooltip
        className="bg-gradient-to-t from-zinc-900/80 to-zinc-950/80 backdrop-blur"
        content={SettingsTooltipContent}
        show={show}
      />
    </>
  );
}

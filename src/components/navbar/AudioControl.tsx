import { MIN_GLOBAL_VOLUME, MAX_GLOBAL_VOLUME } from "appConstants";
import useDebouncedField from "hooks/useDebouncedField";
import { useState } from "react";
import { BsVolumeDownFill } from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { setTransportBPM, setTransportVolume } from "redux/slices/transport";
import { AppDispatch, RootState } from "redux/store";
import { BPM, Volume } from "types/units";

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

export default connector(AudioControl);

function AudioControl(props: Props) {
  const { bpm, volume, setBPM, setVolume } = props;
  const [BPMInput, setBPMInput] = useState(bpm);

  return (
    <>
      <div className="flex relative">
        <input
          type="number"
          id="bpm"
          className={`block px-2.5 pb-2.5 pt-3 w-20 text-lg bg-transparent rounded-lg border-1 appearance-none text-white focus:border-sky-500 focus:outline-none focus:ring-0 peer`}
          value={BPMInput}
          onChange={(e) => setBPMInput(parseInt(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isNaN(parseInt(e.currentTarget.value))) {
              setBPM(parseInt(e.currentTarget.value));
              e.currentTarget.blur();
            }
          }}
          placeholder=" "
        />
        <label
          htmlFor="bpm"
          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-2 peer-focus:px-2 peer-focus:text-sky-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1`}
        >
          BPM
        </label>
      </div>
      <div className="flex relative ml-1">
        <BsVolumeDownFill className="text-4xl" />
        <input
          type="range"
          className="accent-white w-28"
          value={props.volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          min={MIN_GLOBAL_VOLUME}
          step={1}
          max={MAX_GLOBAL_VOLUME}
        />
      </div>
    </>
  );
}

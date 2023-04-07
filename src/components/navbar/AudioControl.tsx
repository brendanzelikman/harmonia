import { MIN_GLOBAL_VOLUME, MAX_GLOBAL_VOLUME } from "appConstants";
import useDebouncedField from "hooks/useDebouncedField";
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
  const VolumeInput = useDebouncedField<Volume>(props.setVolume, props.volume);
  const BPMInput = useDebouncedField<BPM>(props.setBPM, props.bpm);

  return (
    <>
      <div className="flex relative">
        <input
          type="number"
          id="bpm"
          className={`block px-2.5 pb-2.5 pt-3 w-20 text-lg bg-transparent rounded-lg border-1 appearance-none text-white ${
            !!BPMInput.value ? "border-slate-400/80" : "border-slate-400/25"
          } focus:border-sky-500 focus:outline-none focus:ring-0 peer`}
          value={BPMInput.value ?? ""}
          onChange={BPMInput.onChange}
          onKeyDown={BPMInput.onKeyDown}
          placeholder=" "
        />
        <label
          htmlFor="bpm"
          className={`absolute text-sm ${
            !!BPMInput.value ? "text-gray-200" : "text-gray-400"
          } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-2 peer-focus:px-2 peer-focus:text-sky-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1`}
        >
          BPM
        </label>
      </div>
      <div className="flex relative ml-1">
        <BsVolumeDownFill className="text-4xl" />
        <input
          type="range"
          className="accent-white w-28"
          value={VolumeInput.value ?? props.volume}
          onChange={VolumeInput.onChange}
          min={MIN_GLOBAL_VOLUME}
          step={1}
          max={MAX_GLOBAL_VOLUME}
        />
      </div>
    </>
  );
}

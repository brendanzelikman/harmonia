import { useEffect, useMemo, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { RootState } from "redux/store";
import { Transport } from "tone";

const startTime = "0:0:0";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  return {
    isStarted: transport.state === "started",
    isStopped: transport.state === "stopped",
    isPaused: transport.state === "paused",
    tick: transport.tick,
  };
};

const connector = connect(mapStateToProps, null);
type Props = ConnectedProps<typeof connector>;

export default connector(Timer);

function Timer(props: Props) {
  const { isStarted, isPaused, tick } = props;
  const [displayedTime, setDisplayedTime] = useState(startTime);

  // Set the displayed time when the transport changes
  useEffect(() => {
    setDisplayedTime(Transport.position.toString());
  }, [tick]);

  const clipClass = useMemo(() => {
    if (isStarted) return "text-gray-50 border-emerald-400";
    if (isPaused) return "text-gray-100 border-slate-300";
    return "text-gray-300 border-slate-500";
  }, [isStarted, isPaused]);

  return (
    <div className="relative">
      <input
        type="text"
        id="timer"
        className={`font-light block px-2 py-1.5 w-32 text-md bg-transparent rounded-lg border appearance-none ${clipClass} focus:border-fuchsia-500 focus:outline-none focus:ring-0 peer`}
        value={displayedTime}
        disabled
      />
      <label
        htmlFor="timer"
        className={`absolute text-xs ${
          isStarted ? "text-white" : "text-gray-300"
        } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-2 left-1`}
      >
        Time ({tick})
      </label>
    </div>
  );
}
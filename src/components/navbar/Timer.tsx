import { useEffect, useMemo, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Transport } from "tone";

const startTime = "0:0:0";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  return {
    isStarted: transport.state === "started",
    isStopped: transport.state === "stopped",
    isPaused: transport.state === "paused",
    time: transport.time,
  };
};

const connector = connect(mapStateToProps, null);
type Props = ConnectedProps<typeof connector>;

export default connector(Timer);

function Timer(props: Props) {
  const { isStarted, isPaused, time } = props;

  const [displayedTime, setDisplayedTime] = useState(startTime);

  // Create a timer to update the displayed time when the transport is started
  useEffect(() => {
    if (!isStarted) return;
    const interval = setInterval(() => {
      setDisplayedTime(Transport.position.toString());
    }, 25);
    return () => clearInterval(interval);
  }, [isStarted]);

  // Set the displayed time when the transport changes
  useEffect(() => {
    setDisplayedTime(Transport.position.toString());
  }, [time]);

  const clipClass = useMemo(() => {
    if (isStarted) return "text-gray-50 border-emerald-500";
    if (isPaused) return "text-gray-100 border-slate-300";
    return "text-gray-300 border-slate-500";
  }, [isStarted, isPaused]);

  return (
    <div className="relative">
      <input
        type="text"
        id="timer"
        className={`font-light block px-2 py-2.5 w-32 text-lg bg-transparent rounded-lg border appearance-none ${clipClass} focus:border-fuchsia-500 focus:outline-none focus:ring-0 peer`}
        value={displayedTime}
        disabled
      />
      <label
        htmlFor="timer"
        className={`absolute text-sm ${
          isStarted ? "text-white" : "text-gray-300"
        } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-2 left-1`}
      >
        Time
      </label>
    </div>
  );
}

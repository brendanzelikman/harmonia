import { BsStop, BsPause, BsPlay, BsArrowRepeat } from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import {
  startTransport,
  pauseTransport,
  stopTransport,
  toggleTransportLoop,
} from "redux/Transport";
import { AppDispatch, RootState } from "redux/store";

import { NavButton } from "./Navbar";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  return {
    isStarted: transport.state === "started",
    isStopped: transport.state === "stopped",
    isLooped: transport.loop,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    start: () => {
      dispatch(startTransport());
    },
    stop: () => {
      dispatch(stopTransport());
    },
    pause: () => {
      dispatch(pauseTransport());
    },
    toggleLoop: () => {
      dispatch(toggleTransportLoop());
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(Transport);

const TransportButton = (props: {
  className?: string;
  children: any;
  onClick?: any;
  label?: string;
}) => (
  <NavButton
    {...props}
    className={`w-10 h-10 border border-slate-400/80 p-2 rounded-full ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </NavButton>
);

function Transport(props: Props) {
  const buttonGradient = "from-slate-800 to-slate-800";
  return (
    <>
      <TransportButton
        label="Stop"
        className={`bg-gradient-to-t ${
          props.isStarted && !props.isStopped
            ? "bg-red-700"
            : !props.isStopped
            ? "bg-red-600/80"
            : buttonGradient
        }`}
        onClick={props.stop}
      >
        <BsStop className="text-[1.5rem]" />
      </TransportButton>
      {props.isStarted ? (
        <TransportButton
          label="Pause"
          className={`bg-gradient-to-t ${
            props.isStarted ? "from-green-600 to-emerald-600" : buttonGradient
          }`}
          onClick={props.pause}
        >
          <BsPause className="text-[1.5rem]" />
        </TransportButton>
      ) : (
        <TransportButton
          label="Play"
          className={`bg-gradient-to-t ${buttonGradient}`}
          onClick={props.start}
        >
          <BsPlay className="text-[1.5rem] pl-[3px]" />
        </TransportButton>
      )}
      <TransportButton
        label="Loop"
        onClick={props.toggleLoop}
        className={`bg-gradient-to-t ${
          !!props.isLooped ? "from-indigo-600 to-indigo-700" : buttonGradient
        }`}
      >
        <BsArrowRepeat className="text-[1.5rem]" />
      </TransportButton>
    </>
  );
}

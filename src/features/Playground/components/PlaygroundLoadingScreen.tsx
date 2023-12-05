import { Splash } from "../../../components/Logo";
import { PlaygroundLoadState } from "../hooks/usePlaygroundLoader";

interface PlaygroundLoadingScreenProps {
  loadState: PlaygroundLoadState;
}

export function PlaygroundLoadingScreen(props: PlaygroundLoadingScreenProps) {
  const { isTransportLoaded } = props.loadState;

  /** Display the appropriate loading text if the transport is loaded. */
  const LoadingText = () => (
    <h2 className="text-white/60 font-light font-nunito text-5xl animate-pulse ease-in-out">
      {isTransportLoaded ? "Loading File..." : "Click to Start"}
    </h2>
  );

  return (
    <div className="container-col animate-in zoom-in -mt-5 shrink-0 cursor-pointer duration-75">
      <Splash spinning />
      <LoadingText />
    </div>
  );
}

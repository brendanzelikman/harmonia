import { Splash } from "../components/Logo";

export function LoadingView(props: { isTransportLoaded: boolean }) {
  const { isTransportLoaded } = props;

  /** Display the appropriate loading text if the transport is loaded. */
  const LoadingText = () => (
    <h2 className="text-white/60 font-extralight font-nunito text-5xl animate-pulse ease-in-out">
      {isTransportLoaded ? "Loading File..." : "Click to Start"}
    </h2>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen shrink-0 cursor-pointer">
      <Splash />
      <LoadingText />
    </div>
  );
}

import { Splash } from "../components/Logo";

export function LoadingView(props: { isTransportLoaded: boolean }) {
  const { isTransportLoaded } = props;

  // A loading text is displayed in the center of the screen
  const LoadingText = () => (
    <h2 className="text-white/60 font-extralight font-nunito text-5xl animate-pulse ease-in-out">
      {isTransportLoaded ? "Loading File..." : "Click to Start"}
    </h2>
  );

  // Otherwise, show the loading page
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen shrink-0 cursor-pointer">
      <Splash />
      <LoadingText />
    </div>
  );
}

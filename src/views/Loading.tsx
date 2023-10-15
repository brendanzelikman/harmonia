import { selectTransport } from "redux/selectors";
import { Splash } from "../components/Logo";
import { useAppSelector } from "redux/hooks";

export const LoadingView = () => {
  const { loaded, loading } = useAppSelector(selectTransport);

  // A loading text is displayed in the center of the screen
  const LoadingText = () => (
    <h2 className="text-white/60 font-extralight font-nunito text-5xl animate-pulse ease-in-out">
      {loading ? "Loading File..." : "Click to Start"}
    </h2>
  );

  // If the transport is loaded, don't render anything
  if (loaded) return null;

  // Otherwise, show the loading page
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen shrink-0 cursor-pointer">
      <Splash />
      <LoadingText />
    </div>
  );
};

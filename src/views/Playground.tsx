import {
  useGlobalHotkeys,
  useMidiController,
  useTransportLoader,
  useProjectLoader,
} from "hooks";
import { Navbar } from "features/Navbar/Navbar";
import { Timeline } from "features/Timeline";
import { Editor } from "features/Editor/Editor";
import { ShortcutsMenu } from "features/Shortcuts";
import { LoadingView } from "views";
import { TourBackground } from "features/Tour";
import { Logo } from "components/Logo";
import { BsEmojiFrown } from "react-icons/bs";

/** The playground contains the DAW */
export function PlaygroundView() {
  const isProjectLoaded = useProjectLoader();
  const isTransportLoaded = useTransportLoader();
  useGlobalHotkeys();
  useMidiController();

  // If the project or transport is not loaded, show a loading page.
  if (!isProjectLoaded || !isTransportLoaded) {
    return <LoadingView isTransportLoaded={isTransportLoaded} />;
  }

  // Otherwise, show the playground.
  return (
    <>
      <div className="relative hidden lg:flex flex-col fade-in h-screen">
        <TourBackground />
        <Navbar />
        <main className="w-full relative flex flex-auto overflow-hidden">
          <Timeline />
          <Editor />
          <ShortcutsMenu />
        </main>
      </div>
      <div className="flex flex-col lg:hidden h-full text-center px-8 fade-in justify-center items-center space-y-2 font-nunito md:text-2xl sm:text-xl text-md">
        <BsEmojiFrown className="mb-4 text-sky-500 md:w-48 md:h-48 sm:w-36 sm:h-36 w-24 h-24" />
        <h1 className="text-white">
          Sorry, Harmonia is not supported for this viewport yet!
        </h1>
        <h2 className="text-slate-400">But maybe some day...</h2>
      </div>
    </>
  );
}

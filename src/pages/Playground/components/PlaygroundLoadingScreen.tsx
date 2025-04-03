import LogoImage from "assets/images/logo.png";

interface PlaygroundLoadingScreenProps {
  isLoaded: boolean;
}

export function PlaygroundLoadingScreen(props: PlaygroundLoadingScreenProps) {
  const { isLoaded } = props;
  return (
    <div className="size-full flex-col total-center animate-in fade-in zoom-in-90 -mt-5 shrink-0 cursor-pointer duration-300">
      <div className="flex flex-col py-24 -mt-16 items-center font-nunito">
        <img
          src={LogoImage}
          className={`sm:w-60 sm:h-60 w-36 h-36 mb-8 rounded-full shadow-xl shadow-slate-800/40 ${
            isLoaded ? "animate-spin" : ""
          }`}
        />
        <h1 className="font-semibold text-slate-50 sm:text-7xl text-5xl">
          Harmonia
        </h1>
        <p className="my-2 text-slate-400 sm:text-3xl text-sm">
          Explore Tonality Like Never Before.
        </p>
        <p className="text-slate-400 sm:text-3xl text-sm">
          Embrace the Future of Music.
        </p>
      </div>
      <h2 className="text-white/60 font-light font-nunito text-5xl animate-pulse ease-in-out">
        {isLoaded ? "Loading File..." : "Click to Start"}
      </h2>
    </div>
  );
}

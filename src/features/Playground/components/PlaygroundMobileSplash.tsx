import { GiAbstract005 } from "react-icons/gi";

export const PlaygroundMobileSplash = () => {
  return (
    <div className="flex flex-col md:hidden h-full text-center px-8 animate-in fade-in justify-center items-center space-y-2 font-nunito md:text-2xl sm:text-xl">
      <GiAbstract005 className="mb-4 text-sky-500 md:w-48 md:h-48 sm:w-36 sm:h-36 w-24 h-24" />
      <h1 className="text-white">
        Sorry, Harmonia is not supported for this viewport yet!
      </h1>
      <h2 className="text-slate-400">But maybe some day...</h2>
    </div>
  );
};

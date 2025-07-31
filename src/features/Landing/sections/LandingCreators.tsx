import { LandingSection } from "../components/LandingSection";
import { libraries } from "./LandingLibraries";
import Brendan from "/media/brendan.png";
import Dmitri from "/media/dmitri.jpg";

export const LandingCreators = () => {
  return (
    <LandingSection className="pt-nav animate-in fade-in duration-300 bg-slate-950/50">
      <div className="text-center text-5xl font-bold px-8 mt-4 py-6 select-none">
        Behind the Scenes
      </div>
      <div className="total-center flex-wrap gap-12 mt-12">
        <div className="flex gap-8 mr-12 max-sm:mr-0 max-sm:flex-col max-sm:items-center max-sm:text-center">
          <a
            href="https://brendanzelikman.github.io/"
            className="size-54 border-4 border-rose-500/80 shrink-0 rounded-full overflow-hidden"
          >
            <img
              className="h-fit scale-200 min-w-0 -ml-20 max-sm:-ml-10 object-fill"
              src={Brendan}
            />
          </a>
          <div className="flex flex-col text-base max-sm:text-sm">
            <h1 className="text-3xl mb-4"> Brendan Zelikman</h1>
            <h2 className="text-gray-400">Stanford University, MA / MST '27</h2>
            <h2 className="text-gray-400">Princeton University, AB COS '23</h2>
            <p className="mt-4 text-gray-300 w-xs">
              Brendan is the lead designer and developer of Harmonia, originally
              his senior thesis at Princeton University. He is currently a
              graduate student at Stanford University.
            </p>
          </div>
        </div>
        <div className="flex gap-8 ml-12 max-sm:ml-0 max-sm:flex-col-reverse max-sm:items-center">
          <div className="flex flex-col text-base max-sm:text-sm text-right max-sm:text-center">
            <h1 className="text-3xl mb-4"> Dmitri Tymoczko</h1>
            <h2 className="text-gray-400">
              Professor of Music, Princeton University
            </h2>
            <h2 className="text-gray-400">
              Harvard, Oxford, UC Berkeley, and more
            </h2>
            <p className="mt-4 text-gray-300 w-xs">
              Dmitri is a collaborator and intellectual inspiration of Harmonia,
              originally Brendan's advisor for his senior thesis. He is
              currently a Professor of Music at Princeton University.
            </p>
          </div>
          <a
            href="https://dmitri.mycpanel.princeton.edu/"
            className="size-54 border-4 border-orange-400/80 shrink-0 rounded-full overflow-hidden"
          >
            <img className="h-fit object-fill" src={Dmitri} />
          </a>
        </div>
        <div className="text-5xl pt-4 font-bold w-full text-center">
          Instrumental Libraries
        </div>
        <div className="flex gap-16 flex-wrap border-2 px-8 py-4 rounded border-indigo-500/50 bg-slate-950/50">
          {libraries.map((library) => (
            <a
              key={library.title}
              href={library.link}
              className="w-20 relative group total-center"
            >
              <img src={library.image} className="w-24 cursor-pointer" />
              <div className="absolute top-25 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <div className="text-lg font-bold">{library.title}</div>
                  <div className="text-base text-gray-400">
                    {library.description}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </LandingSection>
  );
};

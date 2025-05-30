import { m } from "framer-motion";
import { LandingSection } from "./components/LandingSection";
import { PopupHeader } from "./components/LandingHeader";
import { libraries } from "./LandingLibraries";

const variants = {
  hidden: { opacity: 0, translateY: 20 },
  show: { opacity: 1, translateY: 0 },
};

export const LandingCreators = () => {
  return (
    <LandingSection className="pt-2 bg-slate-950/50">
      <PopupHeader title="Behind the Scenes" />
      <m.div
        className="total-center flex-wrap gap-16 mt-10"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
      >
        <m.div
          className="flex gap-8 mr-12"
          variants={variants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <a
            href="https://brendanzelikman.github.io/"
            className="size-54 shrink-0 rounded-full overflow-hidden"
          >
            <img
              className="h-fit scale-200 min-w-0 -ml-20 object-fill"
              src="https://brendanzelikman.github.io/assets/portrait-DIvDyemr.png"
            />
          </a>
          <div className="flex flex-col text-base">
            <h1 className="text-3xl mb-4"> Brendan Zelikman</h1>
            <h2 className="text-gray-400">Stanford University, MA / MST '27</h2>
            <h2 className="text-gray-400">Princeton University, AB COS '23</h2>
            <p className="mt-4 text-gray-300 w-xs">
              Brendan is the lead designer and developer of Harmonia, originally
              his senior thesis at Princeton University. He is currently a
              graduate student at Stanford University.
            </p>
          </div>
        </m.div>
        <m.div
          className="flex gap-8 ml-12"
          variants={variants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <a
            href="https://dmitri.mycpanel.princeton.edu/"
            className="size-54 shrink-0 rounded-full overflow-hidden"
          >
            <img
              className="h-fit object-fill"
              src="https://kellercenter.princeton.edu/sites/default/files/styles/square/public/images/Dmitri.jpg?h=120c1784&itok=iEOjEFZS"
            />
          </a>
          <div className="flex flex-col text-base">
            <h1 className="text-3xl mb-4"> Dmitri Tymoczko</h1>
            <h2 className="text-gray-400">
              Professor of Music, Princeton University
            </h2>
            <h2 className="text-gray-400">
              Harvard, Oxford, UC Berkeley, and more
            </h2>
            <p className="mt-4 text-gray-300 w-xs">
              Dmitri is the co-founder and intellectual inspiration of Harmonia,
              originally Brendan's advisor for his senior thesis. He is
              currently a Professor of Music at Princeton University.
            </p>
          </div>
        </m.div>
        <div className="text-5xl pb-4 font-bold w-full text-center">
          Core Technologies
        </div>
        <m.div className="flex gap-12 border-2 px-8 py-4 rounded-lg border-indigo-500/50 bg-slate-950/50 backdrop-blur">
          {libraries.map((library) => (
            <a href={library.link} className="w-24 relative group total-center">
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
        </m.div>
      </m.div>
    </LandingSection>
  );
};

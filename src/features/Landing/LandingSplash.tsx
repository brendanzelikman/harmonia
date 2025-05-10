import { m } from "framer-motion";
import Logo from "/logo.png";
import Screenshot from "/media/screenshot.png";
import { Link, useNavigate } from "react-router-dom";
import { useError } from "app/router";
import { Navbar } from "features/Navbar/Navbar";

const speed = 0.8;

export const Splash = () => {
  const navigate = useNavigate();
  const { hasError, errorMessage } = useError();
  const title = "Harmonia";

  let subtitle = "Expressive Musical Calculation.";
  if (hasError) subtitle = "Unexpected Error";

  let subtitle2 = "Find Voice Leadings in Seconds.";
  if (hasError) subtitle2 = errorMessage;

  let button = "Open Playground";
  if (hasError) button = "Proceed to Website";

  return (
    <m.div
      layout
      className="relative w-full total-center max-[1350px]:flex-col min-[1350px]:gap-18 px-12 sm:pt-24 pt-12 pb-0 text-slate-50"
    >
      <Navbar />
      <div className="total-center-col">
        <m.h1
          className="sm:my-2 mt-8 font-bold flex items-center gap-4 sm:text-8xl text-6xl drop-shadow-xl"
          initial={{ opacity: 0, translateY: 50, scale: 0.5 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ delay: 0, duration: 0.5, type: "spring" }}
          style={{ color: hasError ? "#f55e" : "white" }}
        >
          <img src={Logo} className="size-30" /> {title}
        </m.h1>
        <m.p
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.3 }}
          className={`font-normal text-xl max-[1350px]:hidden ${
            hasError
              ? "sm:text-2xl text-lg text-red-500"
              : "sm:text-4xl text-xl drop-shadow-xl text-indigo-50/90"
          }`}
        >
          {subtitle}
        </m.p>
        <m.p
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.3 }}
          className={`max-[1350px]:hidden mb-4 ${
            hasError
              ? "font-light sm:text-2xl text-lg text-red-500"
              : "font-normal sm:text-4xl text-xl drop-shadow-xl text-indigo-50/90"
          }`}
        >
          {subtitle2}
        </m.p>
        <button
          type="button"
          onClick={() => navigate("/playground")}
          className="animate-in fade-in cursor-pointer py-6 my-2 px-20 text-slate-100 active:animate-pulseSlow bg-slate-900/80 zoom-in-50 active:bg-slate-900/90 border-2 border-blue-500/80 hover:border-blue-500 hover:ring-2 hover:ring-blue-500 transition-all duration-300 rounded-3xl backdrop-blur-xl shadow-2xl drop-shadow-2xl sm:text-4xl text-3xl font-light"
        >
          {button}
        </button>
        <m.div className="flex max-[1350px]:hidden animate-in fade-in zoom-in mt-4 gap-2 text-xl text-slate-400">
          <Link to="/projects" className="hover:text-blue-300">
            Projects
          </Link>
          <span>•</span>
          <Link to="/demos" className="hover:text-blue-300">
            Demos
          </Link>
          <span>•</span>
          <Link to="/tutorial" className="hover:text-blue-300">
            Tutorial
          </Link>
        </m.div>
      </div>
      <m.div
        className="total-center py-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.3 * speed,
          duration: 0.3,
          type: "spring",
          stiffness: 100,
        }}
      >
        <m.img
          src={Screenshot}
          className="w-2xl border-slate-900 border-8 rounded-lg"
        />
      </m.div>
    </m.div>
  );
};

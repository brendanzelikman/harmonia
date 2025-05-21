import { m } from "framer-motion";
import Logo from "/logo.png";
import { useNavigate } from "react-router-dom";
import { useError } from "app/router";
import { Navbar } from "features/Navbar/Navbar";

export const Splash = () => {
  const navigate = useNavigate();
  const { hasError } = useError();

  return (
    <m.div
      layout
      className="relative w-full total-center-col min-[1350px]:gap-18 px-12 pb-0 text-slate-50"
    >
      <div className="max-lg:hidden">
        <Navbar />
      </div>
      <div className="flex flex-col">
        <div className="total-center-col">
          <m.h1
            className="sm:my-2 flex items-center gap-4 sm:text-7xl text-6xl font-semibold drop-shadow-lg drop-shadow-slate-950"
            initial={{ opacity: 0, translateY: 20, scale: 0.8 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ delay: 0, duration: 0.5, type: "spring" }}
            style={{ color: hasError ? "#f55e" : "white" }}
          >
            <img src={Logo} className="size-24" />
            Harmonia
          </m.h1>
          <button
            type="button"
            onClick={() => navigate("/playground")}
            className="sm:text-3xl text-2xl font-base cursor-pointer py-2 my-3 px-10 text-slate-100 active:animate-pulseSlow bg-slate-900/80 zoom-in-75 active:bg-slate-900/90 border-2 border-blue-500/80 hover:border-blue-500 hover:ring-2 hover:ring-blue-500 transition-all duration-300 rounded-3xl backdrop-blur-xl shadow-2xl drop-shadow-2xl drop-shadow-sky-900 animate-in fade-in"
          >
            Open Musical Calculator
          </button>
        </div>
      </div>
    </m.div>
  );
};

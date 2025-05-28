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
      className="relative w-full total-center-col min-[1350px]:gap-18 px-12 pb-0 text-slate-50"
      viewport={{ once: true }}
    >
      <div className="max-lg:hidden">
        <Navbar />
      </div>
      <div className="flex flex-col">
        <div className="total-center-col">
          <m.h1
            className="sm:my-2 flex items-center gap-4 sm:text-7xl text-6xl font-semibold drop-shadow-lg drop-shadow-slate-950"
            initial={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              duration: 0.1,
              type: "spring",
              stiffness: 100,
              mass: 0.5,
            }}
            viewport={{ once: true }}
            style={{ color: hasError ? "#f55e" : "white" }}
          >
            <img src={Logo} className="size-24" />
            Harmonia
          </m.h1>
          <m.button
            type="button"
            initial={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              duration: 0.1,
              type: "spring",
              stiffness: 200,
              mass: 0.5,
              delay: 0.1,
            }}
            viewport={{ once: true }}
            onClick={() => navigate("/playground")}
            className="sm:text-3xl text-2xl font-base cursor-pointer py-2 my-3 px-10 text-slate-100 active:animate-pulseSlow bg-slate-900/80 active:bg-slate-900/90 border-2 border-blue-500/80 hover:border-blue-500 hover:ring-2 hover:ring-blue-500 rounded-3xl backdrop-blur-xl shadow-2xl drop-shadow-2xl drop-shadow-sky-900"
          >
            Open Musical Playground
          </m.button>
        </div>
      </div>
    </m.div>
  );
};

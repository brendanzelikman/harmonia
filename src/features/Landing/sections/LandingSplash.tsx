import { m } from "framer-motion";
import Logo from "/logo.png";
import { useNavigate } from "react-router-dom";
import { CALCULATOR } from "app/router";

export const LandingSplash = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full total-center-col max-lg:mt-4 text-slate-50">
      <m.div
        className="lg:my-2 flex items-center gap-4 sm:text-7xl max-sm:text-5xl font-semibold drop-shadow-lg drop-shadow-slate-950"
        initial={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        viewport={{ once: true }}
      >
        <img src={Logo} className="size-24 max-sm:size-14" />
        <h1>Harmonia</h1>
      </m.div>
      <m.div
        initial={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        onClick={() => navigate(CALCULATOR)}
        className="sm:text-3xl text-xl font-base cursor-pointer py-2 my-3 px-10 text-slate-100 bg-slate-900/90 active:bg-slate-900 border-2 border-blue-500/80 hover:border-blue-500 hover:ring-2 hover:ring-blue-500 rounded-3xl max-sm:rounded-xl"
      >
        Open Musical Calculator
      </m.div>
    </section>
  );
};

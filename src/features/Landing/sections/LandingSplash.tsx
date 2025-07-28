import Logo from "/logo.png";
import { useNavigate } from "react-router-dom";
import { CALCULATOR } from "app/router";

export const LandingSplash = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full total-center-col max-lg:mt-4 text-slate-50">
      <div className="lg:my-2 animate-in fade-in slide-in-from-bottom-8 duration-300 flex items-center gap-4 sm:text-7xl max-sm:text-5xl font-semibold drop-shadow-lg drop-shadow-slate-950">
        <img src={Logo} className="size-24 max-sm:size-14" />
        <h1>Harmonia</h1>
      </div>
      <button
        type="button"
        className="sm:text-3xl text-xl animate-in fade-in slide-in-from-top-8 duration-300 font-base cursor-pointer py-2 my-3 px-10 text-slate-100 bg-radial from-slate-950/20 to-slate-950/80 active:bg-slate-900 border-3 border-blue-700 hover:scale-[1.02] drop-shadow-2xl hover:border-blue-600 transition-all backdrop-blur rounded-2xl max-sm:rounded-lg"
        onClick={() => navigate(CALCULATOR)}
      >
        Open Musical Calculator
      </button>
    </section>
  );
};

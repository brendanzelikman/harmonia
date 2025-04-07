import { m } from "framer-motion";
import Logo from "assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useError } from "lib/react-router-dom";

export const Splash = () => {
  const navigate = useNavigate();
  const { hasError, errorMessage } = useError();

  const title = "Harmonia";

  let subtitle = "A Digital Audio Workstation";
  if (hasError) subtitle = "Unexpected Error";

  let subtitle2 = "with Functional Tonality";
  if (hasError) subtitle2 = errorMessage;

  let button = "Make Music Now";
  if (hasError) button = "Proceed to Website";

  return (
    <div className="relative w-full h-full flex flex-col pt-16 items-center text-slate-50">
      <m.div
        className="sm:size-76 size-64"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          type: "spring",
          bounce: 0.3,
          stiffness: 200,
        }}
      >
        <m.img
          src={Logo}
          className="w-full h-full rounded-full"
          initial={{ boxShadow: "0px 0px 50px 50px #01bcfa30" }}
          whileInView={{ boxShadow: "0px 0px 30px 30px #01bcfa50" }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </m.div>
      <m.h1
        className="sm:my-2 mt-8 font-bold sm:text-8xl text-6xl drop-shadow-xl"
        initial={{ opacity: 0, translateY: 50, scale: 0.5 }}
        whileInView={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
        style={{ color: hasError ? "#f55e" : "white" }}
      >
        {title}
      </m.h1>
      <m.p
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className={`font-normal text-xl ${
          hasError
            ? "sm:text-2xl text-lg text-red-500"
            : "sm:text-4xl text-xl drop-shadow-xl text-indigo-50/90"
        }`}
      >
        {subtitle}
      </m.p>
      <m.p
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className={
          hasError
            ? "font-light sm:text-2xl text-lg text-red-500"
            : "font-normal sm:text-4xl text-xl drop-shadow-xl text-indigo-50/90"
        }
      >
        {subtitle2}
      </m.p>
      <m.button
        initial={{ opacity: 0, scale: 0.2, translateY: 5 }}
        whileInView={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{
          delay: 1.5,
          duration: 0.3,
          type: "spring",
          stiffness: 100,
        }}
        type="button"
        onClick={() => navigate("/projects")}
        className="mt-16 py-6 px-9 text-slate-100 active:animate-pulse-slow bg-slate-900/50 zoom-in active:bg-slate-900/70 hover:scale-105 hover:shadow-[0px_0px_20px_2px_rgb(80,80,200)] ring-2 ring-indigo-500/50 hover:ring-slate-100/20 rounded-2xl backdrop-blur-xl shadow-2xl drop-shadow-2xl sm:text-4xl text-2xl font-light"
      >
        {button}
      </m.button>
    </div>
  );
};

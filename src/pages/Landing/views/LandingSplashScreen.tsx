import { m } from "framer-motion";
import { LandingSection } from "../components";
import Logo from "assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useLandingError } from "../hooks/useLandingError";

export const LandingSplashScreen = () => {
  const navigate = useNavigate();
  const { hasError, errorMessage } = useLandingError();

  const title = "Harmonia";
  const titleClass =
    "sm:my-2 mt-8 font-bold sm:text-9xl text-6xl drop-shadow-xl";

  const subtitle = hasError ? errorMessage : "Illuminate the Geometry of Music";
  const subtitleClass = hasError
    ? "font-light sm:text-2xl text-lg text-red-500"
    : "font-normal sm:text-4xl text-xl drop-shadow-xl";
  const button = hasError ? "Proceed to Website" : "Make Music Now";

  const buttonClass =
    "mt-16 py-6 px-9 text-slate-100 hover:animate-pulse-slow bg-[#00aaff]/70 active:bg-blue-950/90 hover:shadow-[0px_0px_10px_10px_rgb(15,150,200)] ring-2 ring-slate-900/20 hover:ring-slate-100/20 rounded-2xl backdrop-blur-xl shadow-2xl drop-shadow-2xl sm:text-4xl text-2xl font-light";

  return (
    <LandingSection>
      <div className="relative w-full h-full flex flex-col pt-16 items-center font-nunito text-slate-50">
        <m.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="sm:size-76 size-64"
        >
          {
            <m.img
              initial={{ boxShadow: "0px 0px 50px 50px #01bcfa30" }}
              whileInView={{ boxShadow: "0px 0px 30px 30px #01bcfa50" }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }}
              src={Logo}
              className="w-full h-full rounded-full"
            />
          }
        </m.div>
        <m.h1
          initial={{ opacity: 0, translateY: 50, scale: 1.5 }}
          whileInView={{ opacity: 1, translateY: 0, scale: 1 }}
          className={titleClass}
        >
          {title}
        </m.h1>
        <m.p
          initial={{ opacity: 0, translateY: 5 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          exit={{ opacity: 0, translateY: 5 }}
          className={subtitleClass}
        >
          {subtitle}
        </m.p>
        <m.button
          initial={{ opacity: 0, translateY: 50 }}
          whileInView={{
            opacity: 1,
            translateY: 0,
            transition: { delay: 0.2 },
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, scale: 1.1 }}
          type="button"
          onClick={(e) =>
            e.shiftKey ? navigate("/playground") : navigate("/projects")
          }
          className={buttonClass}
        >
          {button}
        </m.button>
      </div>
    </LandingSection>
  );
};

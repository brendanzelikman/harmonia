import { HTMLMotionProps, m } from "framer-motion";

export const LandingImageGroup = (props: HTMLMotionProps<"div">) => (
  <m.div
    {...props}
    initial={{ opacity: 0, filter: "blur(10px)" }}
    whileInView={{ opacity: 1, filter: "blur(0px)" }}
    transition={{ duration: 0.3 }}
    className="flex flex-col xl:flex-row items-center w-full px-12 py-18 bg-slate-950/70 backdrop-blur-lg gap-16"
  />
);

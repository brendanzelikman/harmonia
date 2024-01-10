import { m } from "framer-motion";

export const LandingPopupHeader = (props: { title: string }) => (
  <m.h1
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="mb-16 text-5xl text-center text-balance px-8 py-6 text-white font-bold select-none"
  >
    {props.title}
  </m.h1>
);

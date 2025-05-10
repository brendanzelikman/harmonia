import { m } from "framer-motion";

export const PopupHeader = (props: { title: string }) => (
  <m.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
    viewport={{ once: true }}
    className="mb-16 text-5xl text-center text-balance px-8 mt-4 py-6 text-white font-bold select-none"
  >
    {props.title}
  </m.div>
);

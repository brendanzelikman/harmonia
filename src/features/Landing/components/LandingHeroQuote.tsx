import { MotionProps, m } from "framer-motion";

export const LandingHeroQuoteContainer = (props: MotionProps) => (
  <m.div
    {...props}
    className="w-full bg-slate-950/50 rounded-xl ring ring-indigo-500/20 backdrop-blur flex flex-col flex-1 justify-center gap-8 py-6"
  />
);

export const LandingHeroQuote = (props: {
  title?: string;
  text?: React.ReactNode;
}) => (
  <section className="flex w-full mb-10 justify-center items-center">
    <blockquote className="md:w-full text-center white text-balance">
      <h3 className="mb-2 text-slate-50 font-semibold text-2xl whitespace-pre-line">
        {props.title}
      </h3>
      <div className="text-slate-200 font-light text-xl space-y-8">
        {props.text}
      </div>
    </blockquote>
  </section>
);

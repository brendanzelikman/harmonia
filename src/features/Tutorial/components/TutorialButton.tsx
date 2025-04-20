import classNames from "classnames";
import { m } from "framer-motion";
import { ReactNode } from "react";

export const TimelineButton = (
  props: Partial<{
    background: string;
    border: string;
    stripColor: string;
    Icon: React.FC;
    onClick: () => void;
    className: string;
    title: ReactNode;
    subtitle: ReactNode;
    description: ReactNode;
  }>
) => (
  <m.div
    variants={{
      hidden: { opacity: 0, scale: 0.5 },
      show: { opacity: 1, scale: 1 },
    }}
    className={classNames(
      props.className,
      props.border,
      props.background ?? "bg-radial from-slate-800/80 to-slate-950/50",
      "hover:ring-4 backdrop-blur-lg transition-all duration-300 cursor-pointer w-full max-w-xl items-center flex flex-col gap-1 ring-2 p-6 rounded select-none"
    )}
    onClick={props.onClick}
  >
    {props.Icon && (
      <div className="text-8xl">
        <props.Icon />
      </div>
    )}
    <div
      className={classNames(
        props.stripColor ?? "border-b-slate-50/5",
        "font-bold flex-center gap-2 text-base w-full pb-1 border-b"
      )}
    >
      <div className="flex flex-col items-center mt-2 mb-1">
        <div className="font-bold text-slate-50 text-xl">{props.title}</div>
        <div className="font-light text-slate-400 capitalize">
          ({props.subtitle})
        </div>
      </div>
    </div>
    <div className="flex justify-evenly items-center p-2 max-xl:flex-wrap text-sm text-slate-200">
      <div className="grow flex flex-col p-1 gap-4 w-[18rem]">
        {props.description}
      </div>
    </div>
  </m.div>
);

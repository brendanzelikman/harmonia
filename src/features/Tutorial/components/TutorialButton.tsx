import classNames from "classnames";
import { m } from "framer-motion";
import { ReactNode } from "react";

export const TimelineButton = (
  props: Partial<{
    background: string;
    border: string;
    stripColor: string;
    Icon: React.FC;
    iconClass: string;
    onClick: () => void;
    className: string;
    title: ReactNode;
    titleClass: string;
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
      props.background ?? "bg-radial from-slate-700/70 to-slate-950/65",
      "hover:ring-4 transition-all duration-300 backdrop-blur-lg cursor-pointer size-full max-w-xl total-center-col gap-1 ring-2 p-6 rounded select-none"
    )}
    onClick={props.onClick}
  >
    {props.Icon && (
      <div className={props.iconClass ?? "max-lg:text-lg text-8xl"}>
        <props.Icon />
      </div>
    )}
    <div
      className={classNames(
        props.stripColor ?? "border-b border-b-slate-50/5",
        "font-bold flex-center gap-2 text-base w-full pb-1"
      )}
    >
      <div className="flex flex-col items-center mt-2">
        <div className={props.titleClass ?? "font-bold text-slate-50 text-xl"}>
          {props.title}
        </div>
        {!!props.subtitle && (
          <div className="font-light text-slate-400 capitalize">
            ({props.subtitle})
          </div>
        )}
      </div>
    </div>
    {!!props.description && (
      <div className="flex justify-evenly items-center mt-1 p-2 max-xl:flex-wrap text-sm text-slate-200">
        <div className="grow flex flex-col p-1 gap-4 w-[18rem]">
          {props.description}
        </div>
      </div>
    )}
  </m.div>
);

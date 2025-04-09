import classNames from "classnames";
import { m } from "framer-motion";
import { ReactNode } from "react";
import { BsCheckCircleFill } from "react-icons/bs";

interface CardProps {
  title: ReactNode;
  description: string;
  features: string[];
  onClick?: () => void;
  slide?: number;
}

export function LandingCard(props: CardProps) {
  const { title, description, features } = props;
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, translateY: props.slide ?? 0 },
        show: { opacity: 1, translateY: 0 },
      }}
      onClick={props.onClick}
      className={classNames(
        "flex flex-col bg-slate-950/80 backdrop-blur w-96 items-center min-h-[30rem] ring-4 ring-opacity-75 p-6 py-10 rounded-xl",
        props.onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className="total-center-col w-full">
        <div className="w-full *:mx-auto size-36 text-9xl font-bold border-b border-b-slate-500/50 text-white capitalize pb-4">
          {title}
        </div>
        <div className="text-2xl text-slate-100 my-7 font-normal">
          {description}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {features.map((feature) => (
          <div key={feature} className="flex space-x-4">
            <BsCheckCircleFill className="size-6 text-slate-100" />
            <p className="text-lg text-gray-500">{feature}</p>
          </div>
        ))}
      </div>
    </m.div>
  );
}

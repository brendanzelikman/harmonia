import classNames from "classnames";
import { BsCheckCircleFill } from "react-icons/bs";

interface LandingPriceBoxProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isEnabled?: boolean;
  onClick?: () => void;
}

export function LandingPriceBox(props: LandingPriceBoxProps) {
  const { name, price, description, features, isEnabled } = props;

  return (
    <div
      onClick={props.onClick}
      className={classNames(
        "flex flex-col w-96 items-center p-12 py-10 rounded-xl",
        "bg-slate-950/80 backdrop-blur",
        props.onClick ? "cursor-pointer" : "cursor-default",
        { "ring-prodigy": name === "prodigy" },
        { "ring-pro": name === "maestro" },
        { "ring-virtuoso": name === "virtuoso" },
        { "ring-4 ring-opacity-75": isEnabled },
        { "ring ring-opacity-50": !isEnabled }
      )}
    >
      <div className="flex flex-col w-full justify-center">
        <h2 className="flex items-center text-4xl font-bold mb-4 border-b border-b-slate-500/50 capitalize pb-4">
          {name}
        </h2>
        <p className="text-xl text-slate-100 font-light">{description}</p>
      </div>
      <div className="flex flex-col w-full items-start mt-8 gap-2">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center justify-center space-x-4"
          >
            <BsCheckCircleFill className="size-6 text-slate-100" />
            <p className="text-lg text-gray-500">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

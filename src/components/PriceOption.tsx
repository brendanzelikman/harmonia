import { useState } from "react";
import { BsCheck } from "react-icons/bs";

interface PriceOptionProps {
  name: string;
  price: number;
  monthly?: boolean;
  description: string;
  features: string[];
}

export function PriceOption(props: PriceOptionProps) {
  const { name, price, monthly, description, features } = props;

  return (
    <div className="flex flex-col w-96 items-center bg-slate-950/80 backdrop-blur p-12 py-10 rounded-xl border-2 border-slate-600">
      <div className="flex flex-col w-full justify-center">
        <h2 className="text-4xl font-bold mb-4 border-b border-b-slate-500/50 pb-4">
          {name}
        </h2>
        <h3>
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-lg ml-2 font-light text-slate-400">
            {monthly ? "per month" : ""}
          </span>
        </h3>
        <p className="text-lg text-gray-500">{description}</p>
      </div>
      <div className="flex flex-col w-full items-start mt-8 gap-2">
        {features.map((feature) => (
          <div className="flex items-center justify-center space-x-4">
            <BsCheck className="size-6 bg-slate-200 rounded-full text-slate-900" />
            <p className="text-lg text-gray-500">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

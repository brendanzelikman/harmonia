import { PropsWithChildren } from "react";

export const HomeContainer = (props: PropsWithChildren) => {
  return (
    <div className="size-full flex flex-col p-6 bg-indigo-950/20 backdrop-blur">
      {props.children}
    </div>
  );
};

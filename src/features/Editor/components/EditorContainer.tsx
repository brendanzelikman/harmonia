import { PropsWithChildren } from "react";

export const EditorContainer = (props: PropsWithChildren) => (
  <div className="flex flex-col size-full text-white animate-in fade-in duration-300">
    {props.children}
  </div>
);

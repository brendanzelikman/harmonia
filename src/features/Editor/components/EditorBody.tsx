import { PropsWithChildren } from "react";

export const EditorBody = (props: PropsWithChildren) => (
  <div className="p-2 flex relative size-full overflow-scroll outline-none">
    {props.children}
  </div>
);

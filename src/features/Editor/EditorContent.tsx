import classNames from "classnames";
import { PropsWithChildren } from "react";

/** The container wraps the entire editor. */
export const EditorContainer = (props: PropsWithChildren) => (
  <div className="w-[calc(100%-300px)] h-full flex flex-col top-0 right-0 z-[91] absolute bg-gradient-to-t from-[#09203f] to-[#33454b] transition-all animate-in fade-in">
    {props.children}
  </div>
);

/** The body wraps the sidebar and the content. */
export const EditorBody = (props: PropsWithChildren) => (
  <div className="p-2 flex relative size-full overflow-hidden outline-none">
    {props.children}
  </div>
);

/** The sidebar contains the list of presets. */
export const EditorSidebar = (props: PropsWithChildren) => (
  <div className="flex shrink-0 whitespace-nowrap h-full flex-col rounded-xl overflow-hidden pl-1">
    {props.children}
  </div>
);

/** The sidebar header is a title for the presets. */
export const EditorSidebarHeader = (props: PropsWithChildren) => (
  <div className="flex items-center p-3 text-xl font-bold">
    {props.children}
  </div>
);

/** The sidebar list contains a column of presets. */
export const EditorSidebarList = (props: PropsWithChildren) => (
  <div className="w-full flex-auto min-h-[10rem] flex flex-col text-gray-300 overflow-auto">
    {props.children}
  </div>
);

/** The content wraps the title and interactive elements. */
export const EditorContent = (props: PropsWithChildren) => (
  <div {...props} className="grow min-w-0 min-h-0 px-6 flex flex-col py-4">
    {props.children}
  </div>
);

/** The title contains the name of the object being edited. */
export const EditorTitle = (props: PropsWithChildren) => (
  <div className="w-full bg-transparent select-none text-3xl font-semibold ring-0 border-0 p-0 focus:border outline-none rounded focus:bg-slate-800/30">
    {props.children}
  </div>
);

/** The title underline is a gradient line under the title. */
export const EditorTitleUnderline = (props: { className?: string }) => (
  <div className={classNames(props.className, "w-full h-[2px] my-1.5")} />
);

/** The subtitle contains a description of the object being edited. */
export const EditorSubtitle = (props: PropsWithChildren) => (
  <div className="text-xl font-light text-slate-300">{props.children}</div>
);

import { Transition } from "@headlessui/react";
import { TRACK_WIDTH } from "appConstants";
import { BsSearch } from "react-icons/bs";
import { EditorProps } from ".";
import EditorInstrument from "./instrument";
import EditorPatterns from "./patterns";
import EditorScales from "./scales";

export function Editor(props: EditorProps) {
  const allowedStates = ["scale", "patterns", "instrument"];
  const showEditor =
    props.showEditor && allowedStates.includes(props.editorState);
  return (
    <Transition
      show={showEditor}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-75"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as="div"
      className={`absolute bottom-0 right-0 h-full bg-gradient-to-t from-[#09203f] to-[#33454b] backdrop-blur-xl`}
      style={{ width: `calc(100% - ${TRACK_WIDTH}px)` }}
    >
      <div className="flex flex-col w-full h-full z-70">
        <div className="min-h-0 h-full">
          <EditorTransition show={props.editorState === "scale"}>
            <EditorScales {...props} />
          </EditorTransition>
          <EditorTransition show={props.editorState === "patterns"}>
            <EditorPatterns {...props} />
          </EditorTransition>
          <EditorTransition show={props.editorState === "instrument"}>
            <EditorInstrument {...props} />
          </EditorTransition>
        </div>
      </div>
    </Transition>
  );
}

export const EditorTransition = (props: { show: boolean; children?: any }) => {
  return (
    <Transition
      show={!!props.show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="w-full h-full"
    >
      {props.children}
    </Transition>
  );
};

export const Container = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`flex flex-col w-full h-full text-white ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const Title = (props: {
  className?: string;
  title?: string;
  color?: string;
  subtitle?: string;
  editable?: boolean;
  setTitle?: (title: string) => void;
}) => {
  return (
    <div
      className={`${
        props.className ?? ""
      } flex flex-col h-24 px-2 mt-2 mb-5 justify-center font-semibold`}
    >
      <input
        className="w-full bg-transparent text-3xl font-semibold ring-0 outline-none rounded focus:bg-slate-800/30"
        value={props.title}
        onChange={(e) => props.setTitle?.(e.target.value)}
        disabled={!props.editable}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <div className={`w-full h-0.5 my-1.5 ${props.color ?? ""}`}></div>
      {props.subtitle ? (
        <span className="text-xl font-light text-slate-300">
          {props.subtitle}
        </span>
      ) : null}
    </div>
  );
};

export const Header = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`flex items-center px-4 flex-shrink-0 font-nunito ${
        props.className ?? ""
      }`}
    >
      <h1>{props.children}</h1>
    </div>
  );
};

export const Body = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`p-5 flex w-full h-full overflow-scroll ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const Sidebar = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`flex min-w-[18rem] flex-col rounded-xl overflow-hidden pr-5 ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const Content = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`w-full min-h-0 h-full px-8 py-2 flex flex-col overflow-hidden ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const CardHeader = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`flex items-center p-3 text-lg font-bold ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const Menu = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`w-full min-h-[8.5rem] flex flex-shrink-0 text-white text-[28px] overflow-scroll ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const MenuGroup = (props: {
  label?: string;
  className?: string;
  children?: any;
}) => {
  return (
    <div
      className={`flex flex-col mx-auto min-w-max flex-shrink-0 px-2 select-none ${
        props.className ?? ""
      }`}
    >
      <div className="flex flex-col items-center w-full mx-auto px-2 py-3 h-full whitespace-nowrap border border-gray-700 rounded-lg bg-slate-700/50">
        <div className="flex">{props.children}</div>
        <label className="mt-auto flex justify-center text-xl font-nunito">
          {props.label}
        </label>
      </div>
    </div>
  );
};

export const MenuHeader = (props: { className?: string; children?: any }) => {
  return (
    <div
      className={`flex items-center my-2 font-medium text-xl ${
        props.className ?? ""
      }`}
    >
      <h3 className={`whitespace-nowrap`}>{props.children}</h3>
    </div>
  );
};

export const MenuButton = ({
  className = "",
  active,
  activeClass = "",
  disabled,
  disabledClass = "",
  onClick,
  children,
}: {
  className?: string;
  active?: boolean;
  activeClass?: string;
  disabled?: boolean;
  disabledClass?: string;
  onClick?: () => void;
  children: any;
}) => {
  return (
    <div
      className={`flex items-center justify-center m-2 ${
        disabled
          ? `${disabledClass} opacity-50 cursor-default`
          : active
          ? activeClass
          : `${className} cursor-pointer`
      }`}
      onClick={disabled ? () => null : onClick}
    >
      {children}
    </div>
  );
};

export const List = (props: { className?: string; children?: any }) => {
  return (
    <ul
      className={`w-full h-full flex flex-col text-gray-300 overflow-scroll ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </ul>
  );
};

export const ListItem = ({
  className,
  active,
  activeClass,
  onClick,
  children,
}: {
  className?: string;
  active?: boolean;
  activeClass?: string;
  onClick?: () => void;
  children: any;
}) => {
  return (
    <li
      className={`mx-2 p-2 font-light cursor-pointer ${className ?? ""} ${
        active ? activeClass : ""
      }`}
      onClick={onClick}
    >
      {children}
    </li>
  );
};

export const ScoreContainer = (props: {
  className?: string;
  children?: any;
}) => {
  return (
    <div
      className={`bg-white relative w-full flex items-center h-auto overflow-auto border-2 shadow-xl rounded-xl ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export const ScoreBlur = (props: { className?: string }) => {
  return (
    <div
      className={`absolute left-0 top-0 w-full h-full p-2 z-30 pointer-events-none ${
        props.className ?? ""
      }`}
    ></div>
  );
};

export const SearchBox = (props: {
  query: string;
  setQuery: (query: string) => void;
}) => {
  return (
    <div className="relative pr-2">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
        <BsSearch />
      </div>
      <input
        className="text-white w-full rounded m-2 p-2 pl-8 outline-none bg-transparent border border-gray-500 focus:border-gray-400"
        placeholder="Quick Search"
        value={props.query}
        onChange={(e) => props.setQuery(e.target.value)}
      />
    </div>
  );
};

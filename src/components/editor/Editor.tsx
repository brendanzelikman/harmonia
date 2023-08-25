import { Listbox, Transition } from "@headlessui/react";
import { BsCheck, BsGear, BsSearch, BsSoundwave } from "react-icons/bs";
import { EditorProps } from ".";
import { Tooltip as FBTooltip } from "flowbite-react";
import EditorInstrument from "./instrument";
import EditorPatterns from "./patterns";
import EditorScales from "./scales";
import { useState } from "react";
import {
  INSTRUMENT_NAMES,
  createGlobalInstrument,
  getGlobalInstrument,
  getInstrumentName,
} from "types/instrument";

export type StateProps = {
  showingTracks: boolean;
  showingPresets: boolean;
  showingTooltips: boolean;
  toggleTracks: () => void;
  togglePresets: () => void;
  toggleTooltips: () => void;
};

export function Editor(props: EditorProps) {
  // State management
  const allowedStates = ["scale", "patterns", "instrument"];
  const showingEditor =
    props.showingEditor && allowedStates.includes(props.editorState);
  const [state, setState] = useState({
    showingTracks: true,
    showingPresets: true,
    showingTooltips: false,
  });

  // Extra properties
  const toggleTracks = () =>
    setState({ ...state, showingTracks: !state.showingTracks });
  const togglePresets = () =>
    setState({ ...state, showingPresets: !state.showingPresets });
  const toggleTooltips = () =>
    setState({ ...state, showingTooltips: !state.showingTooltips });

  // Full editor state
  const customProps: StateProps = {
    showingTracks: state.showingTracks,
    showingPresets: state.showingPresets,
    showingTooltips: state.showingTooltips,
    toggleTracks,
    togglePresets,
    toggleTooltips,
  };
  const [showingMenu, setShowingMenu] = useState(false);

  const EditorNavbar = () => (
    <div
      className={`w-full flex justify-center items-center h-[30px] text-white rounded-br-md p-2 text-xs font-light bg-gradient-to-b from-gray-300/20 to-slate-500/30 select-none whitespace-nowrap`}
    >
      <b
        className="flex font-light capitalize cursor-pointer mr-3 text-md"
        onClick={() => setShowingMenu(!showingMenu)}
      >
        Editor Settings <BsGear className="ml-2 text-lg my-auto" />
      </b>

      {showingMenu ? (
        <div className="space-x-3">
          <span className="cursor-pointer" onClick={toggleTracks}>
            {state.showingTracks ? "Hide" : "Show"} Tracks
          </span>
          <span className="w-1">•</span>
          <span className="cursor-pointer" onClick={togglePresets}>
            {state.showingPresets ? "Hide" : "Show"} Presets
          </span>
          <span className="w-1">•</span>
          <span className="cursor-pointer" onClick={toggleTooltips}>
            {state.showingTooltips ? "Hide" : "Show"} Tooltips
          </span>
        </div>
      ) : null}

      <span className="w-full ml-auto"></span>
      <span className="pr-2 cursor-pointer" onClick={props.hideEditor}>
        Close Editor
      </span>
    </div>
  );

  return (
    <Transition
      show={showingEditor}
      enter="transition-all duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-all duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as="div"
      className={`absolute bottom-0 right-0 ${
        state.showingTracks ? `w-[calc(100%-300px)]` : `w-full`
      } duration-75 ease-in-out h-full bg-gradient-to-t from-[#09203f] to-[#33454b] backdrop-blur-xl`}
    >
      <EditorNavbar />
      <div
        className={`flex flex-col w-full h-[calc(100%-30px)] z-50 relative ${
          props.tour.active ? "opacity-50" : ""
        }`}
      >
        <div className="min-h-0 h-full" id="editor">
          <EditorTransition show={props.editorState === "scale"}>
            <EditorScales {...props} {...customProps} />
          </EditorTransition>
          <EditorTransition show={props.editorState === "patterns"}>
            <EditorPatterns {...props} {...customProps} />
          </EditorTransition>
          <EditorTransition show={props.editorState === "instrument"}>
            <EditorInstrument {...props} {...customProps} />
          </EditorTransition>
        </div>
      </div>
    </Transition>
  );
}

export const InstrumentListbox = ({
  instrumentName,
  setInstrumentName,
}: {
  instrumentName: string;
  setInstrumentName: (instrumentName: string) => void;
}) => {
  const globalInstrumentName = getGlobalInstrument()?.name ?? "";
  return (
    <Listbox value={globalInstrumentName}>
      {({ open }) => (
        <div className="relative z-50">
          <Listbox.Button className="flex px-2 rounded z-10 h-full items-center text-slate-300 font-light">
            <label className="flex items-center rounded text-left cursor-pointer w-40 text-ellipsis">
              <BsSoundwave className="mr-2 text-lg" />
              {instrumentName || "Change Instrument"}
            </label>
          </Listbox.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-50 w-60 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60">
              {INSTRUMENT_NAMES.map((i) => (
                <Listbox.Option
                  key={i}
                  value={i}
                  className={({ active }) =>
                    `${active ? "text-amber-900 bg-amber-100" : "text-gray-900"}
            cursor-default select-none relative py-2 pl-10 pr-4`
                  }
                  onClick={() => {
                    setInstrumentName(getInstrumentName(i) || "");
                    createGlobalInstrument(i);
                  }}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`${
                          selected ? "font-medium" : "font-normal"
                        } block truncate`}
                      >
                        {getInstrumentName(i)}
                      </span>
                      {selected ? (
                        <span
                          className={`text-amber-600 absolute inset-y-0 left-0 flex items-center pl-3`}
                        >
                          <BsCheck />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

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
      } flex flex-col h-24 mb-5 justify-center font-semibold`}
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
      className={`flex items-center px-2 flex-shrink-0 font-nunito ${
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
      className={`p-2 flex w-full h-full overflow-scroll ${
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
      className={`flex min-w-[18rem] flex-col rounded-xl overflow-hidden pr-5 pl-1 ${
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

export const SidebarHeader = (props: {
  className?: string;
  children?: any;
}) => {
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

export const EffectMenu = (props: { className?: string; children?: any }) => {
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

export const EffectGroup = (props: {
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

export const MenuRow = (props: {
  show: boolean;
  border?: boolean;
  children?: any;
}) => (
  <Transition
    enter="transition-opacity duration-150"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-150"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    as="div"
    className={`flex w-full py-1 text-slate-200 ${
      props.border ? "border-b border-b-slate-500" : ""
    }`}
    show={props.show}
  >
    {props.children}
  </Transition>
);

export const MenuGroup = (props: { children?: any; border?: boolean }) => (
  <div
    className={`flex text-lg ${
      props.border ? "border-r border-r-slate-500" : ""
    }`}
  >
    {props.children}
  </div>
);

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
      className={`flex w-5 h-5 text-lg items-center justify-center m-2 select-none ${
        disabled
          ? `${disabledClass} opacity-50 cursor-default`
          : active
          ? `${activeClass} cursor-pointer`
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
      className={`bg-white relative w-full z-20 flex items-center h-auto min-h-[200px] overflow-auto border-2 shadow-xl ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
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

export const Tooltip = (props: any) => {
  const { children, show, ...rest } = props;
  return show ? <FBTooltip {...rest}>{children}</FBTooltip> : <>{children}</>;
};

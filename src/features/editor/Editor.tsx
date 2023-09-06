import { Transition } from "@headlessui/react";
import {
  BsGear,
  BsMusicNoteBeamed,
  BsSearch,
  BsSoundwave,
} from "react-icons/bs";
import { EditorProps } from ".";
import { Tooltip as FBTooltip } from "flowbite-react";
import EditorInstrument from "./instruments";
import EditorPatterns from "./patterns";
import EditorScales from "./scales";
import { useState } from "react";
import {
  INSTRUMENT_NAMES,
  InstrumentName,
  createGlobalInstrument,
  getGlobalInstrument,
  getInstrumentName,
} from "types/instrument";
import wholeNote from "assets/noteheads/whole.svg";
import halfNote from "assets/noteheads/half.png";
import quarterNote from "assets/noteheads/quarter.png";
import eighthNote from "assets/noteheads/8th.png";
import sixteenthNote from "assets/noteheads/16th.png";
import thirtysecondNote from "assets/noteheads/32nd.png";
import sixtyfourthNote from "assets/noteheads/64th.png";
import { DURATIONS, DURATION_NAMES, Duration } from "types/units";
import { EditorListbox, EditorListboxProps } from "./components/Listbox";
export { EditorListbox as CustomListbox } from "./components/Listbox";

export type StateProps = {
  showingTracks: boolean;
  showingPresets: boolean;
  showingTooltips: boolean;
  toggleTracks: () => void;
  togglePresets: () => void;
  toggleTooltips: () => void;
};

export function Editor(props: EditorProps) {
  // Only show the editor if the id is one of the visible states
  const visibleStates = ["scale", "patterns", "instrument"];
  if (!visibleStates.includes(props.id)) return null;

  // State management
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
      show={!!props.show}
      enter="transition-all duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as="div"
      className={`absolute bottom-0 right-0 ${
        state.showingTracks ? `w-[calc(100%-300px)]` : `w-full`
      } h-full bg-gradient-to-t from-[#09203f] to-[#33454b] backdrop-blur-xl font-nunito`}
    >
      <EditorNavbar />
      <div
        style={{ height: "calc(100% - 30px)" }}
        className={`flex flex-col w-full z-50 relative ${
          props.showingTour ? "opacity-50" : ""
        }`}
      >
        <div className="min-h-0 h-full" id="editor">
          {props.id === "scale" ? (
            <EditorScales {...props} {...customProps} />
          ) : null}
          {props.id === "patterns" ? (
            <EditorPatterns {...props} {...customProps} />
          ) : null}
          {props.id === "instrument" ? (
            <EditorInstrument {...props} {...customProps} />
          ) : null}
        </div>
      </div>
    </Transition>
  );
}

export const DurationListbox = (
  props: Pick<
    EditorListboxProps<Duration>,
    "value" | "setValue" | "className" | "borderColor"
  >
) => {
  const options = DURATIONS;
  const value = props.value ?? options[0];
  return (
    <EditorListbox
      value={value}
      setValue={props.setValue}
      getOptionName={(d) => DURATION_NAMES[d]}
      icon={<BsMusicNoteBeamed className="mr-2" />}
      options={options}
      placeholder="Change Duration"
      borderColor={props.borderColor}
      className={props.className}
    />
  );
};

export const InstrumentListbox = (props: {
  setInstrument: (name: string) => void;
}) => {
  const value = (getGlobalInstrument()?.name ??
    "grand_piano") as InstrumentName;
  return (
    <EditorListbox
      value={value}
      setValue={(value) => props.setInstrument(value)}
      onChange={(value) => createGlobalInstrument(value)}
      getOptionName={(i) => getInstrumentName(i)}
      icon={<BsSoundwave className="mr-2" />}
      options={INSTRUMENT_NAMES}
      placeholder="Change Instrument"
    />
  );
};

export const EditorTransition = (props: {
  id?: string;
  show: boolean;
  children?: any;
}) => {
  return (
    <Transition
      show={!!props.show}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="relative w-full h-full"
      id={props.id}
    >
      {props.children}
    </Transition>
  );
};

export const Container = (props: {
  id?: string;
  className?: string;
  children?: any;
}) => {
  return (
    <div
      id={props.id}
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
      <div
        style={{ backgroundSize: "400%" }}
        className={`w-full h-0.5 my-1.5 animate-[animate-gradient_3s_ease_infinite] ${
          props.color ?? ""
        }`}
      ></div>
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
      className={`flex items-center px-2 flex-shrink-0 ${
        props.className ?? ""
      }`}
    >
      <h1>{props.children}</h1>
    </div>
  );
};

export const Body = (props: {
  id?: string;
  className?: string;
  children?: any;
}) => {
  return (
    <div
      id={props.id}
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
        <label className="mt-auto flex justify-center text-xl">
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

export const MenuGroup = (props: {
  children?: any;
  border?: boolean;
  className?: string;
}) => (
  <div
    className={`flex text-lg px-1 ${
      props.border ? "border-r border-r-slate-500" : ""
    } ${props.className ?? ""}`}
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
      className={`flex h-5 items-center justify-center text-center my-2 xl:mx-[4px] lg:mx-[3px] rounded select-none font-light text-xs ${
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

interface DurationButtonProps {
  active?: boolean;
  onClick?: () => void;
  showTooltip?: boolean;
}

const activeNoteClass = "bg-orange-400 ring ring-orange-400";

export const SixtyFourthButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Sixty-Fourth Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={sixtyfourthNote} />
    </MenuButton>
  </Tooltip>
);

export const ThirtySecondButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Thirty-Second Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={thirtysecondNote} />
    </MenuButton>
  </Tooltip>
);

export const SixteenthButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Sixteenth Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={sixteenthNote} />
    </MenuButton>
  </Tooltip>
);

export const EighthButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Eighth Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={eighthNote} />
    </MenuButton>
  </Tooltip>
);

export const QuarterButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Quarter Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain mt-1" src={quarterNote} />
    </MenuButton>
  </Tooltip>
);

export const HalfButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Half Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain mt-0.5" src={halfNote} />
    </MenuButton>
  </Tooltip>
);

export const WholeButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} tooltipContent={`Whole Note`}>
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain mt-3 p-1.5" src={wholeNote} />
    </MenuButton>
  </Tooltip>
);

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

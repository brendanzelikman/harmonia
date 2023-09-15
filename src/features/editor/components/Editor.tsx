import { Transition } from "@headlessui/react";
import {
  BsGear,
  BsMusicNoteBeamed,
  BsSearch,
  BsSoundwave,
} from "react-icons/bs";
import { EditorProps } from "..";
import { Tooltip as FBTooltip } from "flowbite-react";
import EditorInstrument from "../instruments";
import EditorPatterns from "../patterns";
import EditorScales from "../scales";
import { useState } from "react";
import {
  INSTRUMENTS,
  INSTRUMENT_KEYS,
  InstrumentKey,
  createGlobalInstrument,
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
import { EditorListbox, EditorListboxProps } from "./Listbox";
export { EditorListbox as CustomListbox } from "./Listbox";

export type StateProps = {
  showingTracks: boolean;
  showingPresets: boolean;
  showingTooltips: boolean;
  showingPiano: boolean;
  toggleTracks: () => void;
  togglePresets: () => void;
  toggleTooltips: () => void;
  togglePiano: () => void;
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
    showingPiano: true,
  });

  // Extra properties
  const toggleTracks = () =>
    setState({ ...state, showingTracks: !state.showingTracks });
  const togglePresets = () =>
    setState({ ...state, showingPresets: !state.showingPresets });
  const toggleTooltips = () =>
    setState({ ...state, showingTooltips: !state.showingTooltips });
  const togglePiano = () =>
    setState({ ...state, showingPiano: !state.showingPiano });

  // Full editor state
  const customProps: StateProps = {
    ...state,
    toggleTracks,
    togglePresets,
    toggleTooltips,
    togglePiano,
  };
  const [showingMenu, setShowingMenu] = useState(false);

  const EditorNavbar = () => (
    <div
      className={`w-full flex justify-center items-center h-[25px] text-white rounded-br-md p-2 text-xs font-light bg-gradient-to-b from-emerald-100/20 to-slate-500/30 select-none whitespace-nowrap`}
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
          <span className="w-1">•</span>
          <span className="cursor-pointer" onClick={togglePiano}>
            {state.showingPiano ? "Hide" : "Show"} Piano
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
      appear
      show={!!props.show}
      enter="transition-all duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-all duration-150"
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
  const globalInstrument = INSTRUMENTS["global"];
  const value = (globalInstrument?.key ?? "grand_piano") as InstrumentKey;
  return (
    <EditorListbox
      value={value}
      setValue={(value) => props.setInstrument(value)}
      onChange={(value) => createGlobalInstrument(value as InstrumentKey)}
      getOptionKey={(i) => i as InstrumentKey}
      getOptionValue={(i) => i as InstrumentKey}
      getOptionName={(i) => getInstrumentName(i as InstrumentKey)}
      icon={<BsSoundwave className="mr-2" />}
      options={INSTRUMENT_KEYS}
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
      } flex flex-col h-24 mb-2 justify-center font-semibold`}
    >
      <input
        className={`${
          !!props.editable ? "cursor-pointer select-all" : "select-none"
        } w-full bg-transparent text-3xl font-semibold ring-0 border-0 p-0 focus:border outline-none rounded focus:bg-slate-800/30`}
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
      className={`flex min-w-[17rem] h-full flex-col rounded-xl overflow-hidden pr-2 pl-1 ${
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
      className={`w-full min-h-0 h-full px-8 flex flex-col overflow-hidden ${
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

export const MenuRow = (props: {
  show: boolean;
  border?: boolean;
  children?: any;
}) => (
  <Transition
    appear
    enter="transition-all duration-75"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-all duration-75"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    as="div"
    className={`flex w-full items-center py-1 text-slate-200 ${
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
  <Tooltip
    show={props.showTooltip}
    content={`Sixty-Fourth Note`}
    placement="bottom"
  >
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={sixtyfourthNote} />
    </MenuButton>
  </Tooltip>
);

export const ThirtySecondButton = (props: DurationButtonProps) => (
  <Tooltip
    show={props.showTooltip}
    content={`Thirty-Second Note`}
    placement="bottom"
  >
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={thirtysecondNote} />
    </MenuButton>
  </Tooltip>
);

export const SixteenthButton = (props: DurationButtonProps) => (
  <Tooltip
    show={props.showTooltip}
    content={`Sixteenth Note`}
    placement="bottom"
  >
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={sixteenthNote} />
    </MenuButton>
  </Tooltip>
);

export const EighthButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} content={`Eighth Note`} placement="bottom">
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain" src={eighthNote} />
    </MenuButton>
  </Tooltip>
);

export const QuarterButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} content={`Quarter Note`} placement="bottom">
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain mt-1" src={quarterNote} />
    </MenuButton>
  </Tooltip>
);

export const HalfButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} content={`Half Note`} placement="bottom">
    <MenuButton
      className={`w-6 invert ${props.active ? activeNoteClass : ""}`}
      onClick={props.onClick}
    >
      <img className="h-5 object-contain mt-0.5" src={halfNote} />
    </MenuButton>
  </Tooltip>
);

export const WholeButton = (props: DurationButtonProps) => (
  <Tooltip show={props.showTooltip} content={`Whole Note`} placement="bottom">
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
      className={`w-full flex-auto min-h-[10rem] flex flex-col text-gray-300 overflow-auto ${
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
  return (
    <div className="flex items-center justify-center h-full">
      {show ? (
        <FBTooltip
          animation={`duration-500`}
          className="z-50 text-xs"
          {...rest}
        >
          {children ?? null}
        </FBTooltip>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

import { Dialog, Listbox, Transition } from "@headlessui/react";
import { isInputEvent } from "utils";
import useEventListeners from "hooks/useEventListeners";
import { Fragment, useState } from "react";
import { BsCheck } from "react-icons/bs";
import { ConnectedProps, connect } from "react-redux";
import { selectRoot } from "redux/selectors";
import { hideShortcuts, showShortcuts } from "redux/slices/root";
import { AppDispatch, RootState } from "redux/store";

const ShortcutCategory = (props: { name: string }) => {
  return (
    <li className="mb-2 flex justify-between items-center border rounded-lg bg-slate-800/25 border-slate-50/20">
      <h1 className="text-xl font-bold p-3">{props.name}</h1>
    </li>
  );
};

const Shortcut = (props: { shortcut: string; description: string }) => {
  return (
    <li className="flex justify-between items-center whitespace-nowrap">
      <label className="text-bold min-w-[30px] text-center px-3 my-0.5 py-0.5 bg-slate-800/50 border border-slate-50/25 rounded mr-2 drop-shadow-xl">
        {props.shortcut}
      </label>
      <span className="font-light drop-shadow-md">{props.description}</span>
    </li>
  );
};

const ShortcutSection = (props: { children: any }) => {
  return (
    <li className="xl:min-w-[25rem] xl:min-h-[40rem] xl:text-sm w-[20rem] min-h-[45rem] overflow-scroll text-[10px] flex flex-col p-4 m-4 my-0 border border-slate-200/20 shadow-xl bg-slate-700/70 backdrop-blur rounded-xl">
      <ul className="space-y-1 h-full">{props.children}</ul>
    </li>
  );
};

const ShortcutButton = (props: {
  title: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  class?: string;
}) => {
  return (
    <div
      className={`m-8 mt-4 px-6 py-3 cursor-pointer text-lg rounded-xl border border-slate-600/50
      ${props.active ? props.activeClass : props.class}`}
      onClick={props.onClick}
    >
      {props.title}
    </div>
  );
};

function KeyboardShortcuts() {
  return (
    <>
      <ShortcutSection>
        <ShortcutCategory name="Global Shortcuts" />
        <Shortcut shortcut="Cmd + S" description="Save Project" />
        <Shortcut shortcut="Cmd + O" description="Open Project" />
        <Shortcut shortcut="Cmd + Z" description="Undo Action" />
        <Shortcut shortcut="Cmd + Shift + Z" description="Redo Action" />
        <Shortcut shortcut="Space" description="Play/Pause" />
        <Shortcut shortcut="Enter" description="Stop" />
        <Shortcut shortcut="L" description="Toggle Loop" />
        <Shortcut shortcut="S + Click" description="Set Loop Start" />
        <Shortcut shortcut="E + Click" description="Set Loop End" />
        <Shortcut shortcut="P" description="Show/Hide Pattern Editor" />
        <Shortcut shortcut="Esc" description="Close Editor" />
        <Shortcut
          shortcut="Option + Mute"
          description="Mute/Unmute All Tracks"
        />
        <Shortcut
          shortcut="Option + Solo"
          description="Solo/Unsolo All Tracks"
        />
        <Shortcut shortcut="F" description="Toggle Fullscreen" />
        <Shortcut shortcut="Cmd + ," description="Show/Hide Settings" />
        <Shortcut shortcut="?" description="Show/Hide Shortcuts" />
      </ShortcutSection>
      <ShortcutSection>
        <ShortcutCategory name="Timeline Shortcuts" />
        <Shortcut shortcut="A" description="Start/Stop Adding Clips" />
        <Shortcut shortcut="C" description="Start/Stop Cutting Clips" />
        <Shortcut shortcut="M" description="Start/Stop Merging Clips" />
        <Shortcut shortcut="R" description="Start/Stop Repeating Clips" />
        <Shortcut shortcut="T" description="Start/Stop Adding Transpositions" />
        <Shortcut
          shortcut="Left/Right Arrow"
          description="Move Cursor Left/Right"
        />
        <Shortcut
          shortcut="Up/Down Arrow"
          description="Select Previous/Next Track"
        />
        <Shortcut shortcut="Click" description="Select a Timeline Object" />

        <Shortcut
          shortcut="Option + Click"
          description="Select Individual Timeline Objects"
        />
        <Shortcut
          shortcut="Shift + Click"
          description="Select Range of Timeline Objects"
        />
        <Shortcut
          shortcut="Cmd + A"
          description="Select All Timeline Objects"
        />
        <Shortcut shortcut="Cmd + C" description="Copy Timeline Objects" />
        <Shortcut shortcut="Cmd + X" description="Cut Timeline Objects" />
        <Shortcut shortcut="Cmd + V" description="Paste Timeline Objects" />
        <Shortcut shortcut="Cmd + D" description="Duplicate Timeline Objects" />
        <Shortcut shortcut="Delete" description="Delete Timeline Objects" />
      </ShortcutSection>
      <ShortcutSection>
        <ShortcutCategory name="Editor Shortcuts" />
        <Shortcut shortcut="A" description="Start/Stop Adding Notes" />
        <Shortcut shortcut="1 - 5" description="Select Note Durations" />
        <Shortcut shortcut="Play Piano" description="Input Note" />
        <Shortcut
          shortcut="Shift + Play Piano"
          description="Input Note as Chord "
        />
        <Shortcut shortcut="0" description="Input Rest Note" />
        <Shortcut shortcut="Delete" description="Start/Stop Removing Notes" />
        <Shortcut shortcut="Shift + Delete" description="Clear Notes" />
        <Shortcut shortcut="Space" description="Play Notes" />
        <Shortcut shortcut="C" description="Show/Hide Cursor" />
        <Shortcut shortcut="X" description="Set Note As Anchor" />
        <Shortcut
          shortcut="Left/Right Arrow"
          description="Move Cursor Left/Right"
        />
        <Shortcut
          shortcut="Up/Down Arrow"
          description="Transpose Note Up/Down"
        />
        <Shortcut shortcut="T" description="Transpose Along the Chord" />
        <Shortcut shortcut="Shift + T" description="Transpose Chromatically" />

        <Shortcut shortcut="Shift + M" description="Export Notes to MIDI" />
        <Shortcut shortcut="Shift + X" description="Export Notes to MusicXML" />
      </ShortcutSection>
    </>
  );
}

function TranspositionWizard() {
  const [scaleOption, setScaleOption] = useState("Diatonic Transpositions");
  const scaleOptions = [
    "Diatonic Transpositions",
    "Pentatonic Transpositions",
    "Hexatonic Transpositions",
    "Octatonic Transpositions",
  ];
  const [chordOption, setChordOption] = useState("Triadic Transpositions");
  const chordOptions = ["Triadic Transpositions", "Tetradic Transpositions"];
  return (
    <>
      <ShortcutSection>
        <ShortcutCategory name="Chromatic Transpositions" />
        <Shortcut shortcut="N1 / N-1" description="Up/Down a Minor Second" />
        <Shortcut shortcut="N2 / N-2" description="Up/Down a Major Second" />
        <Shortcut shortcut="N3 / N-3" description="Up/Down a Minor Third" />
        <Shortcut shortcut="N4 / N-4" description="Up/Down a Major Third" />
        <Shortcut shortcut="N5 / N-5" description="Up/Down a Perfect Fourth" />
        <Shortcut shortcut="N6 / N-6" description="Up/Down a Tritone" />
        <Shortcut shortcut="N7 / N-7" description="Up/Down a Perfect Fifth" />
        <Shortcut shortcut="N8 / N-8" description="Up/Down a Minor Sixth" />
        <Shortcut shortcut="N9 / N-9" description="Up/Down a Major Sixth" />
        <Shortcut shortcut="N10 / N-10" description="Up/Down a Minor Seventh" />
        <Shortcut shortcut="N11 / N-11" description="Up/Down a Major Seventh" />
        <Shortcut shortcut="N12 / N-12" description="Up/Down an Octave" />
      </ShortcutSection>
      <ShortcutSection>
        <Listbox value={scaleOption} onChange={setScaleOption}>
          {({ open }) => (
            <div className="mb-4 relative">
              <Listbox.Button className="w-full flex justify-between items-center border rounded-lg bg-slate-800/25 border-slate-50/20">
                <h1 className="text-xl font-bold p-3">{scaleOption}</h1>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options
                  static
                  className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-slate-500/50 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm"
                >
                  {scaleOptions.map((option) => (
                    <Listbox.Option
                      className={({ active }) =>
                        `${
                          active ? "bg-slate-600/80" : "bg-slate-700/80"
                        } backdrop-blur cursor-pointer select-none relative py-2 pl-10 pr-4`
                      }
                      value={option}
                      key={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${
                              selected ? "font-medium" : "font-normal"
                            } block truncate`}
                          >
                            {option}
                          </span>
                          {selected ? (
                            <span
                              className={`${
                                active ? "text-sky-600" : "text-sky-600"
                              }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
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
        {scaleOption === "Diatonic Transpositions" ? (
          <>
            <Shortcut shortcut="T1 / T-1" description="Up/Down a Second" />
            <Shortcut shortcut="T2 / T-2" description="Up/Down a Third" />
            <Shortcut shortcut="T3 / T-3" description="Up/Down a Fourth" />
            <Shortcut shortcut="T4 / T-4" description="Up/Down a Fifth" />
            <Shortcut shortcut="T5 / T-5" description="Up/Down an Sixth" />
            <Shortcut shortcut="T6 / T-6" description="Up/Down a Seventh" />
            <Shortcut shortcut="T7 / T-7" description="Up/Down an Octave" />
            <Shortcut shortcut="T8 / T-8" description="Up/Down a Ninth" />
            <Shortcut shortcut="T9 / T-9" description="Up/Down a Tenth" />
            <Shortcut shortcut="T10 / T-10" description="Up/Down an Eleventh" />
            <Shortcut shortcut="T11 / T-11" description="Up/Down a Twelfth" />
            <Shortcut
              shortcut="T12 / T-12"
              description="Up/Down a Thirteenth"
            />
          </>
        ) : scaleOption === "Pentatonic Transpositions" ? (
          <>
            <Shortcut shortcut="T1 / T-1" description="Up/Down 1 Step" />
            <Shortcut shortcut="T2 / T-2" description="Up/Down 2 Steps" />
            <Shortcut shortcut="T3 / T-3" description="Up/Down 3 Steps" />
            <Shortcut shortcut="T4 / T-4" description="Up/Down an Octave" />
            <Shortcut
              shortcut="T5 / T-5"
              description="Up/Down 1 Step + Octave"
            />
            <Shortcut
              shortcut="T6 / T-6"
              description="Up/Down 2 Steps + Octave"
            />
            <Shortcut
              shortcut="T7 / T-7"
              description="Up/Down 3 Steps + Octave"
            />
            <Shortcut shortcut="T8 / T-8" description="Up/Down 2 Octaves" />
            <Shortcut
              shortcut="T9 / T-9"
              description="Up/Down 1 Step + 2 Octaves"
            />
            <Shortcut
              shortcut="T10 / T-10"
              description="Up/Down 2 Steps + 2 Octaves"
            />
            <Shortcut
              shortcut="T11 / T-11"
              description="Up/Down 3 Steps + 2 Octaves"
            />
            <Shortcut shortcut="T12 / T-12" description="Up/Down 3 Octaves" />
          </>
        ) : scaleOption === "Hexatonic Transpositions" ? (
          <>
            <Shortcut shortcut="T1 / T-1" description="Up/Down 1 Step" />
            <Shortcut shortcut="T2 / T-2" description="Up/Down 2 Steps" />
            <Shortcut shortcut="T3 / T-3" description="Up/Down 3 Steps" />
            <Shortcut shortcut="T4 / T-4" description="Up/Down 4 Steps" />
            <Shortcut shortcut="T5 / T-5" description="Up/Down an Octave" />
            <Shortcut
              shortcut="T6 / T-6"
              description="Up/Down 1 Step + Octave"
            />
            <Shortcut
              shortcut="T7 / T-7"
              description="Up/Down 2 Steps + Octave"
            />
            <Shortcut
              shortcut="T8 / T-8"
              description="Up/Down 3 Steps + Octave"
            />
            <Shortcut
              shortcut="T9 / T-9"
              description="Up/Down 4 Steps + Octave"
            />
            <Shortcut shortcut="T10 / T-10" description="Up/Down 2 Octaves" />
            <Shortcut
              shortcut="T11 / T-11"
              description="Up/Down 1 Step + 2 Octaves"
            />
            <Shortcut
              shortcut="T12 / T-12"
              description="Up/Down 2 Steps + 2 Octaves"
            />
          </>
        ) : scaleOption === "Octatonic Transpositions" ? (
          <>
            <Shortcut shortcut="T1 / T-1" description="Up/Down 1 Step" />
            <Shortcut shortcut="T2 / T-2" description="Up/Down 2 Steps" />
            <Shortcut shortcut="T3 / T-3" description="Up/Down 3 Steps" />
            <Shortcut shortcut="T4 / T-4" description="Up/Down 4 Steps" />
            <Shortcut shortcut="T5 / T-5" description="Up/Down 5 Steps" />
            <Shortcut shortcut="T6 / T-6" description="Up/Down 6 Steps" />
            <Shortcut shortcut="T7 / T-7" description="Up/Down 7 Steps" />
            <Shortcut shortcut="T8 / T-8" description="Up/Down 1 Octave" />
            <Shortcut
              shortcut="T9 / T-9"
              description="Up/Down 1 Step + Octave"
            />
            <Shortcut
              shortcut="T10 / T-10"
              description="Up/Down 2 Steps + Octave"
            />
            <Shortcut
              shortcut="T11 / T-11"
              description="Up/Down 3 Steps + Octave"
            />
            <Shortcut
              shortcut="T12 / T-12"
              description="Up/Down 4 Steps + Octave"
            />
          </>
        ) : null}
      </ShortcutSection>
      <ShortcutSection>
        <Listbox value={chordOption} onChange={setChordOption}>
          {({ open }) => (
            <div className="mb-4 relative">
              <Listbox.Button className="w-full flex justify-between items-center border rounded-lg bg-slate-800/25 border-slate-50/20">
                <h1 className="text-xl font-bold p-3">{chordOption}</h1>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options
                  static
                  className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-slate-500/50 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm"
                >
                  {chordOptions.map((option) => (
                    <Listbox.Option
                      className={({ active }) =>
                        `${
                          active ? "bg-slate-600/80" : "bg-slate-700/80"
                        } backdrop-blur cursor-pointer select-none relative py-2 pl-10 pr-4`
                      }
                      value={option}
                      key={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${
                              selected ? "font-medium" : "font-normal"
                            } block truncate`}
                          >
                            {option}
                          </span>
                          {selected ? (
                            <span
                              className={`${
                                active ? "text-sky-600" : "text-sky-600"
                              }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
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
        {chordOption === "Triadic Transpositions" ? (
          <>
            <Shortcut shortcut="t1 / t-1" description="Up/Down 1 Step" />
            <Shortcut shortcut="t2 / t-2" description="Up/Down 2 Steps" />
            <Shortcut shortcut="t3 / t-3" description="Up/Down 1 Octave" />
            <Shortcut
              shortcut="t4 / t-4"
              description="Up/Down 1 Step + Octave"
            />
            <Shortcut
              shortcut="t5 / t-5"
              description="Up/Down 2 Steps + Octave"
            />
            <Shortcut shortcut="t6 / t-6" description="Up/Down 2 Octaves" />
            <Shortcut
              shortcut="t7 / t-7"
              description="Up/Down 1 Step + 2 Octaves"
            />
            <Shortcut
              shortcut="t8 / t-8"
              description="Up/Down 2 Steps + 2 Octaves"
            />
            <Shortcut shortcut="t9 / t-9" description="Up/Down 3 Octaves" />
            <Shortcut
              shortcut="t10 / t-10"
              description="Up/Down 1 Step + 3 Octaves"
            />
            <Shortcut
              shortcut="t11 / t-11"
              description="Up/Down 2 Steps + 3 Octaves"
            />
            <Shortcut shortcut="t12 / t-12" description="Up/Down 4 Octaves" />
          </>
        ) : chordOption === "Tetradic Transpositions" ? (
          <>
            <Shortcut shortcut="t1 / t-1" description="Up/Down 1 Step" />
            <Shortcut shortcut="t2 / t-2" description="Up/Down 2 Steps" />
            <Shortcut shortcut="t3 / t-3" description="Up/Down 3 Steps" />
            <Shortcut shortcut="t4 / t-4" description="Up/Down an Octave" />
            <Shortcut
              shortcut="t5 / t-5"
              description="Up/Down 1 Step + Octave"
            />
            <Shortcut
              shortcut="t6 / t-6"
              description="Up/Down 2 Steps + Octave"
            />
            <Shortcut
              shortcut="t7 / t-7"
              description="Up/Down 3 Steps + Octave"
            />
            <Shortcut shortcut="t8 / t-8" description="Up/Down 2 Octaves" />
            <Shortcut
              shortcut="t9 / t-9"
              description="Up/Down 1 Step + 2 Octaves"
            />
            <Shortcut
              shortcut="t10 / t-10"
              description="Up/Down 2 Steps + 2 Octaves"
            />
            <Shortcut
              shortcut="t11 / t-11"
              description="Up/Down 3 Steps + 2 Octaves"
            />
            <Shortcut shortcut="t12 / t-12" description="Up/Down 3 Octaves" />
          </>
        ) : null}
      </ShortcutSection>
    </>
  );
}

type ShortcutView = "shortcuts" | "transpositions";

function mapStateToProps(state: RootState) {
  const root = selectRoot(state);
  return { showingShortcuts: !!root.showingShortcuts };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    showShortcuts: () => dispatch(showShortcuts()),
    hideShortcuts: () => dispatch(hideShortcuts()),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

export default connector(ShortcutsMenu);

function ShortcutsMenu(props: Props) {
  const [view, setView] = useState<ShortcutView>("shortcuts");
  const viewShortcuts = () => setView("shortcuts");
  const viewTranspositions = () => setView("transpositions");
  useEventListeners(
    {
      "?": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (props.showingShortcuts) {
            props.hideShortcuts();
          } else {
            props.showShortcuts();
          }
        },
      },
    },
    [props.showingShortcuts]
  );
  return (
    <Transition appear show={props.showingShortcuts} as={Fragment}>
      <Dialog
        open={props.showingShortcuts}
        as="div"
        className="relative font-nunito"
        onClose={props.hideShortcuts}
      >
        <div className="fixed inset-0 p-2 z-50 bg-slate-800/80 text-slate-200 backdrop-blur overflow-scroll">
          <div className="flex justify-center">
            <ShortcutButton
              title="Keyboard Shortcuts"
              onClick={viewShortcuts}
              active={view === "shortcuts"}
              activeClass="bg-slate-700/75 drop-shadow-xl"
              class="hover:bg-slate-600/50 active:bg-slate-800"
            />
            <ShortcutButton
              title="Transposition Wizard"
              onClick={viewTranspositions}
              active={view === "transpositions"}
              activeClass="bg-slate-700/75 drop-shadow-xl"
              class="hover:bg-slate-600/50 active:bg-slate-800"
            />
            <ShortcutButton title="Close Menu" onClick={props.hideShortcuts} />
          </div>
          {view === "shortcuts" ? (
            <Transition.Child
              className="flex justify-center items-center flex-wrap"
              as="ul"
              enter="transition ease-out duration-300"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-300"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <KeyboardShortcuts />
            </Transition.Child>
          ) : null}
          {view === "transpositions" ? (
            <Transition.Child
              className="flex justify-center items-center flex-wrap"
              as="ul"
              enter="transition ease-out duration-300"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-300"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <TranspositionWizard />
            </Transition.Child>
          ) : null}
        </div>
      </Dialog>
    </Transition>
  );
}

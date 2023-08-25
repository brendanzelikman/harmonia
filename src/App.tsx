import Navbar from "components/navbar";
import Editor from "components/editor";
import Timeline from "components/timeline";
import useShortcuts from "hooks/useShortcuts";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { RootState } from "redux/store";
import { useState } from "react";
import useEventListeners from "hooks/useEventListeners";
import { Transition } from "@headlessui/react";
import { isInputEvent } from "appUtil";
import Shortcuts from "components/shortcuts";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  const loadedTransport = transport.loaded;
  return { loadedTransport, tour: state.tour };
};

const connector = connect(mapStateToProps, null);

type Props = ConnectedProps<typeof connector>;

export default connector(App);

function App(props: Props) {
  useShortcuts();
  const [showNavbar, setShowNavbar] = useState(true);
  useEventListeners(
    {
      // F = Toggle Fullscreen
      f: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          setShowNavbar(!showNavbar);
        },
      },
    },
    [showNavbar, setShowNavbar]
  );

  return (
    <div
      className={`fade-in flex flex-col flex-nowrap w-full h-screen overflow-auto`}
    >
      <Transition
        show={showNavbar}
        enter="transition-all duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Navbar />
      </Transition>
      <main className="relative flex w-full flex-auto overflow-hidden">
        {props.tour.active ? (
          <div className={`w-full h-full absolute bg-slate-900/40 z-60`} />
        ) : null}
        <Timeline />
        <Editor />
        <Shortcuts />
      </main>
    </div>
  );
}

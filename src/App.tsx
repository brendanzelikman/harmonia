import Navbar from "components/navbar";
import Editor from "components/editor";
import Timeline from "components/timeline";
import useShortcuts from "hooks/useShortcuts";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { RootState } from "redux/store";

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

  return (
    <div className={`flex flex-col flex-nowrap w-full h-screen overflow-auto`}>
      <Navbar />
      <main className="relative flex w-full flex-auto overflow-hidden">
        {props.tour.active ? (
          <div className={`w-full h-full absolute bg-slate-800/50 z-60`} />
        ) : null}
        <Timeline />
        <Editor />
      </main>
    </div>
  );
}

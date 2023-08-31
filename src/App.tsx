import Navbar from "components/navbar";
import Editor from "components/editor";
import Timeline from "components/timeline";
import useShortcuts from "hooks/useShortcuts";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import Loading from "components/Loading";
import Shortcuts from "components/shortcuts";

const mapStateToProps = (state: RootState) => {
  const { loaded } = selectTransport(state);
  return { loaded, isTourActive: state.tour?.active };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {};
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

export default connector(App);

function App(props: Props) {
  useShortcuts();

  // Not Loaded
  if (!props.loaded) return <Loading />;

  // Loaded
  return (
    <div
      className={`fade-in flex flex-col flex-nowrap w-full h-screen overflow-auto`}
    >
      <Navbar />
      <main className="relative flex w-full flex-auto overflow-hidden">
        {props.isTourActive ? (
          <div className={`w-full h-full absolute bg-slate-900/40 z-60`} />
        ) : null}
        <Timeline />
        <Editor />
        <Shortcuts />
      </main>
    </div>
  );
}

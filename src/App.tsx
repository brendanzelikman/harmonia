import Navbar from "features/navbar";
import Editor from "features/editor";
import Timeline from "features/timeline";
import useShortcuts from "hooks/useShortcuts";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { RootState } from "redux/store";
import LoadingPage from "components/LoadingPage";
import Shortcuts from "features/shortcuts";
import { useMemo } from "react";

const mapStateToProps = (state: RootState) => {
  const { loaded } = selectTransport(state);
  return { loaded };
};

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(App);

function App(props: Props) {
  useShortcuts();

  const App = useMemo(() => {
    return () => (
      <div className="fade-in flex flex-col flex-nowrap w-full h-screen overflow-auto">
        <Navbar />
        <main className="relative flex w-full flex-auto overflow-hidden">
          <Timeline />
          <Editor />
          <Shortcuts />
        </main>
      </div>
    );
  }, []);

  if (!props.loaded) return <LoadingPage />;
  return <App />;
}

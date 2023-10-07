import { RootState } from "redux/store";
import { selectTransport } from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import { Splash } from "./Logo";

const mapStateToProps = (state: RootState) => {
  const { loaded, loading } = selectTransport(state);
  return { loaded, loading };
};

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(LoadingPage);

function LoadingPage(props: Props) {
  if (props.loaded) return null;
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen shrink-0 cursor-pointer">
      <Splash />
      <h2 className="text-white/60 font-extralight font-nunito text-5xl animate-pulse ease-in-out">
        {props.loading ? "Loading File..." : "Click to Start"}
      </h2>
    </div>
  );
}

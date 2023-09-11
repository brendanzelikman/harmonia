import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Navbar } from "./components/Navbar";

function mapStateToProps(state: RootState) {
  const transport = selectTransport(state);
  return {
    isLoaded: transport.loaded,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {};
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface NavbarProps extends Props {}

export default connector(Navbar);

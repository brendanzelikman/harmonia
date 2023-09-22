import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";

import { loadTransport, unloadTransport } from "redux/thunks/transport";
import { AppDispatch, RootState } from "redux/store";

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  createAndLoadTransport: async () => {
    dispatch(loadTransport());
  },
  unloadTransport: () => {
    dispatch(unloadTransport());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

interface TransportProps extends Props {}

export default connector(LoadedTransport);

function LoadedTransport(props: TransportProps) {
  const { createAndLoadTransport } = props;

  useEffect(() => {
    try {
      createAndLoadTransport();
    } catch (e) {
      console.error(e);
    }

    return () => {
      props.unloadTransport();
    };
  }, []);

  return null;
}

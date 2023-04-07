import { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";

import { loadTransport } from "redux/slices/transport";
import { AppDispatch, RootState } from "redux/store";

const mapStateToProps = (state: RootState) => ({
  transport: state.transport,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  createAndLoadTransport: async () => {
    dispatch(loadTransport());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

interface TransportProps extends Props {}

export default connector(LoadedTransport);

function LoadedTransport(props: TransportProps) {
  const { createAndLoadTransport } = props;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    try {
      createAndLoadTransport();
      setInitialized(true);
    } catch (e) {
      console.error(e);
    }
  }, [initialized]);

  return null;
}

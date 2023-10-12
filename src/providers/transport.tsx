import { useEffect } from "react";
import { loadTransport, unloadTransport } from "redux/Transport";
import { useAppDispatch } from "redux/hooks";

export default function LoadedTransport() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      dispatch(loadTransport());
    } catch (e) {
      console.error(e);
    }
    return () => {
      dispatch(unloadTransport());
    };
  }, []);

  return null;
}

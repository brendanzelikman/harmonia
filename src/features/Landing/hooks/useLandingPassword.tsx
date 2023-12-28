import { promptModal } from "components/Modal";
import { setAuthenticationStatus } from "indexedDB";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useLandingPassword = () => {
  const navigate = useNavigate();

  // Prompt the user for the password
  const promptPassword = useCallback(async (redirect = false) => {
    const password = await promptModal(
      "Welcome to Harmonia!",
      "Please enter the password to proceed."
    );
    if (password === import.meta.env.VITE_FREE_PASSWORD) {
      setAuthenticationStatus("free");
      if (redirect) navigate("/demos");
    } else if (password === import.meta.env.VITE_PRO_PASSWORD) {
      setAuthenticationStatus("pro");
      if (redirect) navigate("/projects");
    } else if (password === import.meta.env.VITE_VIRTUOSO_PASSWORD) {
      setAuthenticationStatus("virtuoso");
      if (redirect) navigate("/projects");
    } else {
      setAuthenticationStatus(undefined);
    }
  }, []);

  return { promptPassword };
};

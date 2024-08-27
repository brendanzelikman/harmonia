import classNames from "classnames";
import { ActionCodeSettings, Auth, getAuth } from "firebase/auth";
import isElectron from "is-electron";
import { firebaseApp } from "providers/firebase";
import { useState, useEffect } from "react";
import { WEBSITE_URL } from "utils/constants";

interface AccountContinueButtonProps {
  email: string;
  isValidEmail: boolean;
}

export const AccountContinueButton = (props: AccountContinueButtonProps) => {
  const { email, isValidEmail } = props;
  // Change the continue text when the magic link is sent
  const defaultContinueText = "Send the Magic Link";
  const [continueText, setContinueText] = useState(defaultContinueText);
  const [linkTimer, setLinkTimer] = useState<NodeJS.Timeout>();
  const changedContinueText = continueText !== defaultContinueText;

  // Fire the appropriate function based on the password and login state
  const onContinueClick = async () => {
    if (!email.length) return;
    const auth = getAuth(firebaseApp);
    const tag = isElectron() ? "electron" : "link";
    const url = `${WEBSITE_URL}/#/magic-${tag}`;
    const actionCodeSettings: ActionCodeSettings = {
      url,
      handleCodeInApp: true,
    };
    try {
      sendMagicLink(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
    } catch (error) {
      console.error(error);
    }
    setContinueText("Sent the Magic Link!");
    const timer = setTimeout(() => setContinueText(defaultContinueText), 1000);
    setLinkTimer(timer);
  };

  // Clear the timer on unmount
  useEffect(() => {
    return () => {
      setContinueText(defaultContinueText);
      if (linkTimer) {
        clearTimeout(linkTimer);
        setLinkTimer(undefined);
      }
    };
  }, [email]);

  return (
    <button
      className={classNames(
        isElectron()
          ? "w-96 p-4 text-2xl rounded-lg"
          : "w-80 p-2 px-4 text-xl rounded",
        "border border-slate-200/50 transition-colors duration-300 text-white font-semibold",
        changedContinueText
          ? "cursor-default bg-indigo-600"
          : isValidEmail
          ? "cursor-pointer bg-sky-600/70 active:bg-sky-700"
          : "opacity-75 bg-sky-600/70 cursor-default"
      )}
      type="button"
      disabled={!isValidEmail}
      onClick={onContinueClick}
    >
      {continueText}
    </button>
  );
};
function sendMagicLink(
  auth: Auth,
  email: string,
  actionCodeSettings: ActionCodeSettings
) {
  throw new Error("Function not implemented.");
}

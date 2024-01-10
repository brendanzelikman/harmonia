import { firebaseApp } from "firebase";
import { WEBSITE_LOCATION } from "./constants";
import {
  ActionCodeSettings,
  getAuth,
  sendSignInLinkToEmail as sendMagicLink,
  signInWithEmailLink,
} from "firebase/auth";
import isElectron from "is-electron";

/** Send a link to the user's email and flag it in local storage. */
export const sendSignInLinkToEmail = async (email: string) => {
  const auth = getAuth(firebaseApp);
  const tag = isElectron() ? "electron" : "link";
  const url = `${WEBSITE_LOCATION}/#/magic-${tag}`;
  const actionCodeSettings: ActionCodeSettings = { url, handleCodeInApp: true };
  try {
    await sendMagicLink(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
  } catch (error) {
    console.error(error);
  }
};

/** Complete the sign-in for an email link. */
export const completeSignInWithEmailLink = async (emailLink: string) => {
  const email = window.localStorage.getItem("emailForSignIn");
  if (!email) return false;

  try {
    const auth = getAuth(firebaseApp);
    await signInWithEmailLink(auth, email, emailLink);
    window.localStorage.removeItem("emailForSignIn");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/** Sign out the current user. */
export const signOut = async (callback?: () => void) => {
  const auth = getAuth();
  try {
    await auth.signOut();
  } catch (error) {
    console.log(error);
  } finally {
    callback?.();
  }
};

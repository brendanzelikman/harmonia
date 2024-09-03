import { getAuth, signInWithEmailLink } from "firebase/auth";
import { LandingAction } from "pages/landing";
import { firebaseApp } from "providers/firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useMagicLink = (action: LandingAction) => {
  const navigate = useNavigate();

  // Complete sign-in using the magic link
  const applyMagicLink = async (href: string) => {
    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) return;
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailLink(auth, email, href);
    } catch (error) {
      console.log("Error signing in with email link", error);
    } finally {
      window.localStorage.removeItem("emailForSignIn");
      navigate("/");
      window.location.search = "";
    }
  };

  // Redirect the user if the path changes to the magic link
  useEffect(() => {
    if (action === "magic-link") {
      applyMagicLink(window.location.href);
    } else if (action === "magic-electron") {
      const params = window.location.href.split("?")[1];
      const location = `harmonia:///magic-link?${params}`;
      window.location.href = location;
      applyMagicLink(location);
    }
  }, [action]);
};

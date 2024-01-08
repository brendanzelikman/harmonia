import isElectron from "is-electron";
import { LandingAction } from "pages";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeSignInWithEmailLink } from "utils/authentication";

export const useMagicLink = (action: LandingAction) => {
  const navigate = useNavigate();

  // Complete sign-in using the magic link
  const applyMagicLink = (href: string) => {
    completeSignInWithEmailLink(href)
      .then(() => {
        navigate("/");
        window.location.search = "";
      })
      .catch((error) => {
        console.log("Error signing in with email link", error);
      });
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

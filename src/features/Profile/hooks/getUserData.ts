import { trim } from "lodash";
import { useAuthentication } from "providers/authentication";
import { useSubscription } from "providers/subscription";
import { useMemo } from "react";

interface UserData {
  name: string;
  email: string;
  provider: string;
}

export const getUserData = (): UserData => {
  const { user } = useAuthentication();
  const { isMaestro, isVirtuoso } = useSubscription();

  // Helper functions for unpacking fields
  const trimText = (text: string | null) => trim(text ?? "");
  const hasText = (text: string | null) => trimText(text).length > 0;

  // Get the default name based on the user's subscription
  const defaultName = useMemo(() => {
    if (!user) return "Prodigal Harmonist";
    if (isMaestro) return "Maestral Harmonist";
    if (isVirtuoso) return "Virtuosic Harmonist";
    return "Prodigal Harmonist";
  }, [user, isMaestro, isVirtuoso]);

  // Check and trim fields for the user's name
  const name = useMemo(() => {
    if (!user) return defaultName;
    const displayName = trimText(user.displayName);
    if (displayName.length) return displayName;
    const providerName = user.providerData.find((p) => hasText(p.displayName));
    if (providerName) return trimText(providerName.displayName);
    return defaultName;
  }, [user]);

  // Check and trim fields for the user's name
  const email = useMemo(() => {
    if (!user) return "No Email Found";
    const displayEmail = trimText(user.email);
    if (displayEmail.length) return displayEmail;
    const providerEmail = user.providerData.find((p) => hasText(p.email));
    if (providerEmail) return trimText(providerEmail.email);
    return "No Email Found";
  }, [user]);

  // Check the user's provider
  const provider = useMemo(() => {
    if (!user) return "Magic";
    switch (user.providerData[0]?.providerId) {
      case "google.com":
        return "Google";
      case "apple.com":
        return "Apple";
      case "microsoft.com":
        return "Microsoft";
      default:
        return "Email";
    }
  }, [user]);

  return { name, email, provider };
};

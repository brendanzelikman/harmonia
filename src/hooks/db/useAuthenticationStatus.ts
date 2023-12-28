import { openDB } from "idb";
import {
  DATABASE_NAME,
  getAuthenticationStatus,
  AuthenticationStatus,
} from "indexedDB";
import { useCallback, useState } from "react";
import { useDatabaseCallback } from "./useDatabaseCallback";
import { useCustomEventListener } from "hooks/useCustomEventListener";

/** Return the current user's authentication status */
export function useAuthenticationStatus() {
  const [authentication, setAuthentication] = useState<AuthenticationStatus>();
  const [isLoadingAuthentication, setIsLoadingAuthentication] = useState(true);

  const fetchAuthenticationStatus = async () => {
    openDB(DATABASE_NAME)
      .then(async () => {
        const isAuthenticated = await getAuthenticationStatus();
        setAuthentication(isAuthenticated);
      })
      .finally(() => setIsLoadingAuthentication(false));
  };

  useDatabaseCallback(fetchAuthenticationStatus);
  useCustomEventListener("authenticationChanged", fetchAuthenticationStatus);

  const isAuthenticated = authentication !== undefined;
  const isFree = authentication === "free";
  const isPro = authentication === "pro";
  const isVirtuoso = authentication === "virtuoso";

  const isAtLeastStatus = useCallback(
    (level: AuthenticationStatus) => {
      switch (level) {
        case "free":
          return authentication !== undefined;
        case "pro":
          return authentication === "pro" || authentication === "virtuoso";
        case "virtuoso":
          return authentication === "virtuoso";
        default:
          return true;
      }
    },
    [authentication]
  );

  return {
    isLoadingAuthentication,
    isAuthenticated,
    isFree,
    isPro,
    isVirtuoso,
    isAtLeastStatus,
  };
}

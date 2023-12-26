import { openDB } from "idb";
import {
  DATABASE_NAME,
  getAuthenticationStatus,
  AuthenticationStatus,
} from "indexedDB";
import { useState, useEffect } from "react";

/** Return the current user's authentication status */
export function useAuthenticationStatus() {
  const [authentication, setAuthentication] = useState<AuthenticationStatus>();
  const [isLoadingAuthentication, setIsLoadingAuthentication] = useState(true);

  useEffect(() => {
    openDB(DATABASE_NAME)
      .then(async () => {
        const isAuthenticated = await getAuthenticationStatus();
        setAuthentication(isAuthenticated);
      })
      .finally(() => setIsLoadingAuthentication(false));
  }, []);

  const isAuthenticated = authentication !== undefined;
  const isFree = authentication === "free";
  const isPro = authentication === "pro";
  const isVirtuoso = authentication === "virtuoso";
  const isAtLeastPro = isPro || isVirtuoso;

  return {
    isLoadingAuthentication,
    isAuthenticated,
    isFree,
    isPro,
    isVirtuoso,
    isAtLeastPro,
  };
}

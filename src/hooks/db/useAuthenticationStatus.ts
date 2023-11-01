import { openDB } from "idb";
import { DATABASE_NAME, getAuthenticatedStatus } from "indexedDB";
import { useState, useEffect } from "react";

/** Return the current user's authentication status */
export function useAuthenticationStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuthentication, setIsLoadingAuthentication] = useState(true);

  useEffect(() => {
    openDB(DATABASE_NAME)
      .then(async () => {
        const isAuthenticated = await getAuthenticatedStatus();
        setIsAuthenticated(!!isAuthenticated);
      })
      .finally(() => setIsLoadingAuthentication(false));
  }, []);

  return { isLoadingAuthentication, isAuthenticated };
}

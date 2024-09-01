import { firebaseApp } from "providers/firebase";
import { getAuth } from "firebase/auth";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  HarmoniaUser,
  ADMIN,
  defaultHarmoniaUser,
  fetchUser,
  ADMIN_UID,
} from "./user";
import { adminClearance, useClearance } from "./password";
import { initializeDatabase } from "providers/idb";

export const AuthContext = createContext<HarmoniaUser>(defaultHarmoniaUser);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider(props: { children: ReactNode }) {
  const auth = getAuth(firebaseApp);
  const { clearance, isAdmin } = useClearance();
  const [user, setUser] = useState(isAdmin ? ADMIN : defaultHarmoniaUser);

  useEffect(() => {
    // If the user is an admin, initialize the user and skip firebase
    if (clearance === adminClearance) {
      setUser(ADMIN);
      initializeDatabase(ADMIN_UID);
      return;
    }

    // Otherwise, listen for changes through firebase
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(await fetchUser(clearance));
      if (user?.uid) initializeDatabase(user?.uid);
    });
    return unsubscribe;
  }, [auth, clearance]);

  // Return the authentication status
  return (
    <AuthContext.Provider value={{ ...user }}>
      {props.children}
    </AuthContext.Provider>
  );
}

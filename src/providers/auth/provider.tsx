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
  defaultAdmin,
  defaultUser,
  fetchUser,
  ADMIN_UID,
} from "./user";
import { adminClearance, useClearance } from "./password";
import { getDatabase } from "providers/idb/database";

export const AuthContext = createContext<HarmoniaUser>(defaultUser);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider(props: { children: ReactNode }) {
  const auth = getAuth(firebaseApp);
  const { clearance, isAdmin } = useClearance();
  const [user, setUser] = useState(isAdmin ? defaultAdmin : defaultUser);

  useEffect(() => {
    // If the user is an admin, initialize the user and skip firebase
    const fetchDatabase = async () => {
      const db = await getDatabase(ADMIN_UID);
      setUser({ ...defaultAdmin, db });
    };
    if (clearance === adminClearance) {
      fetchDatabase();
      return;
    }

    // Otherwise, listen for changes through firebase
    const unsubscribe = auth.onAuthStateChanged(async (_) => {
      setUser(await fetchUser(clearance));
    });
    return unsubscribe;
  }, [auth, clearance]);

  // Return the authentication status
  return (
    <AuthContext.Provider value={user}>{props.children}</AuthContext.Provider>
  );
}

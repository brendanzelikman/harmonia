import { promptModal } from "components/PromptModal";
import { firebaseApp } from "firebase";
import { User, getAuth } from "firebase/auth";
import { initializeUserDatabase } from "indexedDB";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Authentication info sending user, status, etc.
interface AuthenticationInfo {
  user: User | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  checkPassword: () => Promise<void>;
}

// Default authentication info
const DEFAULT_AUTHENTICATION_INFO: AuthenticationInfo = {
  user: null,
  isAuthenticated: false,
  isLoaded: false,
  checkPassword,
};

// Create a context for the authentication info
export const AuthenticationContext = createContext<AuthenticationInfo>(
  DEFAULT_AUTHENTICATION_INFO
);

// Create a hook for the context
export const useAuthentication = () => useContext(AuthenticationContext);

// Provide the authentication info to the app
export function AuthenticationProvider(props: { children: ReactNode }) {
  const auth = getAuth(firebaseApp);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAuthenticated = !!isLoaded && !!user;

  // Listen for changes to authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoaded(true);
      setUser(user);
      if (user) {
        initializeUserDatabase(user.uid);
      }
    });
    return unsubscribe;
  }, [auth]);

  // Return the authentication status
  const value = { user, isAuthenticated, isLoaded, checkPassword };
  return (
    <AuthenticationContext.Provider value={value}>
      {props.children}
    </AuthenticationContext.Provider>
  );
}

/** Return the current user's authentication status */
export async function getAuthenticationStatus(): Promise<AuthenticationInfo> {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  return { user, isAuthenticated: !!user, isLoaded: true, checkPassword };
}

// Create a handler to check password status
async function checkPassword() {
  const lsPassword = localStorage.getItem("harmonia-password");
  if (lsPassword !== "accepted") {
    const password = await promptModal(
      "Welcome to Harmonia!",
      "Please enter the password to proceed."
    );
    const isCorrect = password === import.meta.env.VITE_PASSWORD;
    if (isCorrect) localStorage.setItem("harmonia-password", "accepted");
    else return;
  }
}

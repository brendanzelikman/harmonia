import { promptModal } from "components/PromptModal";
import { firebaseApp } from "firebase";
import { User, getAuth } from "firebase/auth";
import { useCustomEventListener } from "hooks";
import { initializeUserDatabase } from "indexedDB";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { dispatchCustomEvent } from "utils/html";

// Authentication info sending user, status, etc.
interface AuthenticationInfo {
  user: User | null;
  uid?: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  isLoaded: boolean;
  checkPassword: (forceCheck?: boolean) => Promise<PasswordStatus>;
}

// Default authentication info
const DEFAULT_AUTHENTICATION_INFO: AuthenticationInfo = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isAuthorized: false,
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
  const [isAdmin, setIsAdmin] = useState(getPasswordStatus() === "admin");
  useCustomEventListener("harmonia-password", async (e) => {
    setIsAdmin(e.detail === "admin");
  });
  const isAuthorized = isAuthenticated || isAdmin;
  const uid = isAdmin ? "admin" : user?.uid;

  // Listen for changes to authentication
  useEffect(() => {
    if (isAdmin) {
      initializeUserDatabase("admin");
      setIsLoaded(true);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoaded(true);
      setUser(user);
      if (user) {
        initializeUserDatabase(user.uid);
      }
    });
    return unsubscribe;
  }, [auth, isAdmin]);

  // Return the authentication status
  const value = {
    user,
    uid,
    isAuthenticated,
    isAdmin,
    isAuthorized,
    isLoaded,
    checkPassword,
  };
  return (
    <AuthenticationContext.Provider value={value}>
      {props.children}
    </AuthenticationContext.Provider>
  );
}

/** Return the current user's authentication status */
export async function getAuthenticationStatus(): Promise<AuthenticationInfo> {
  const passwordStatus = getPasswordStatus();

  // Check for admin privileges
  if (passwordStatus === "admin") {
    return {
      user: null,
      uid: "admin",
      isAuthenticated: false,
      isAdmin: true,
      isAuthorized: true,
      isLoaded: true,
      checkPassword,
    };
  }

  // Otherwise, go through Firebase
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const isAuthenticated = !!user;
  const isAuthorized = isAuthenticated;
  return {
    user,
    uid: user?.uid,
    isAuthenticated,
    isAdmin: false,
    isAuthorized,
    isLoaded: true,
    checkPassword,
  };
}

// Create a handler to check password status
type PasswordStatus = "admin" | "user" | null;
async function checkPassword(forceCheck = false): Promise<PasswordStatus> {
  const lsPassword = localStorage.getItem("harmonia-password");
  return new Promise(async (resolve) => {
    if (lsPassword === null || forceCheck) {
      const password = await promptModal(
        "Welcome to Harmonia!",
        "Please enter the password to proceed."
      );

      // Match password with secrets (bypasses authentication)
      const isAdmin =
        password === import.meta.env.VITE_ADMIN_PASSWORD ||
        password === import.meta.env.VITE_SECRET_PASSWORD;

      // Check for admin privileges
      if (isAdmin) {
        localStorage.setItem("harmonia-password", "acceptedAdmin");
        dispatchCustomEvent("harmonia-password", "admin");
        return resolve("admin");
      }

      // Check for regular privileges
      const isCorrect = password === import.meta.env.VITE_PASSWORD;
      if (isCorrect) {
        localStorage.setItem("harmonia-password", "acceptedUser");
        dispatchCustomEvent("harmonia-password", "user");
        return resolve("user");
      }

      return resolve(null);
    }
    return resolve(
      lsPassword === "acceptedAdmin"
        ? "admin"
        : lsPassword === "acceptedUser"
        ? "user"
        : null
    );
  });
}

export const getPasswordStatus = (): PasswordStatus => {
  const lsPassword = localStorage.getItem("harmonia-password");
  if (lsPassword === "acceptedAdmin") return "admin";
  if (lsPassword === "acceptedUser") return "user";
  return null;
};

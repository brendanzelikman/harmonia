import { getAuth, User } from "firebase/auth";
import {
  authorize,
  getClearance,
  Clearance,
  adminClearance,
  userClearance,
} from "./password";
import { firebaseApp } from "providers/firebase";
import { Rank } from "utils/constants";
import isElectron from "is-electron";
import { fetchRank } from "./rank";

// ----------------------------------------
// User Auth
// ----------------------------------------

export const ADMIN_UID = "admin";

export interface UserAuth {
  user: User | null;
  uid: string | null;
  isAuthorized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authorize: (forceCheck?: boolean) => Promise<Clearance>;
}
export const defaultUserAuth: UserAuth = {
  user: null,
  uid: null,
  isAdmin: getClearance() === adminClearance,
  isAuthorized: getClearance() === userClearance,
  isAuthenticated: false,
  authorize,
};

export const defaultAdminAuth: UserAuth = {
  user: null,
  uid: ADMIN_UID,
  isAuthorized: true,
  isAuthenticated: true,
  isAdmin: true,
  authorize,
};

// ----------------------------------------
// User Rank
// ----------------------------------------

export interface UserRank {
  status: Rank;
  isAtLeastRank: (status?: Rank) => boolean;
  isProdigy: boolean;
  isMaestro: boolean;
  isVirtuoso: boolean;
}

export const defaultUserRank: UserRank = {
  status: "prodigy",
  isAtLeastRank: () => false,
  isProdigy: true,
  isMaestro: false,
  isVirtuoso: false,
};

export const defaultAdminRank: UserRank = {
  status: "virtuoso",
  isAtLeastRank: () => true,
  isProdigy: true,
  isMaestro: true,
  isVirtuoso: true,
};

// ----------------------------------------
// User Environment
// ----------------------------------------

export interface UserEnvironment {
  isDesktop: boolean;
  isWeb: boolean;
  isLoaded: boolean;
  canPlay: boolean;
}

export const defaultUserEnvironment: UserEnvironment = {
  isDesktop: isElectron(),
  isWeb: !isElectron(),
  isLoaded: false,
  canPlay: !isElectron(),
};

export const defaultAdminEnvironment: UserEnvironment = {
  isDesktop: isElectron(),
  isWeb: !isElectron(),
  isLoaded: true,
  canPlay: true,
};

// ----------------------------------------
// User Types
// ----------------------------------------

export type HarmoniaUser = UserAuth & UserRank & UserEnvironment;

// Regular users start with no privileges
export const defaultHarmoniaUser: HarmoniaUser = {
  ...defaultUserAuth,
  ...defaultUserRank,
  ...defaultUserEnvironment,
};

// The admin user has all privileges
export const ADMIN: HarmoniaUser = {
  ...defaultAdminAuth,
  ...defaultAdminRank,
  ...defaultAdminEnvironment,
};

// ----------------------------------------
// User Functions
// ----------------------------------------

/** Return the current user's authentication status */
export async function fetchUser(
  clearance = getClearance()
): Promise<HarmoniaUser> {
  if (clearance === adminClearance) return ADMIN;
  if (clearance === null) return { ...defaultHarmoniaUser, isLoaded: true };

  // Otherwise, go through Firebase
  const auth = getAuth(firebaseApp);
  const userId = auth.currentUser?.uid || null;

  // Read from the authenticated user
  const userAuth: UserAuth = {
    user: auth.currentUser,
    uid: userId,
    isAuthenticated: !!auth.currentUser,
    isAuthorized: !!auth.currentUser,
    isAdmin: false,
    authorize,
  };

  // Fetch the subscription status from Firestore
  const status = await fetchRank(userId);
  const userRank: UserRank = {
    status,
    isProdigy: status === "prodigy",
    isMaestro: status === "maestro",
    isVirtuoso: status === "virtuoso",
    isAtLeastRank: (s) => {
      if (status === "virtuoso") return true;
      if (status === "maestro" && s !== "virtuoso") return true;
      if (status === "prodigy" && s === "prodigy") return true;
      return false;
    },
  };

  // Read the environment using Electron
  const userEnvironment: UserEnvironment = {
    isDesktop: isElectron(),
    isWeb: !isElectron(),
    canPlay: !isElectron() || status === "virtuoso",
    isLoaded: true,
  };

  return {
    ...userAuth,
    ...userRank,
    ...userEnvironment,
  };
}

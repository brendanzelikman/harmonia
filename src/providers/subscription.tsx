import { firebaseApp } from "providers/firebase";
import { SubscriptionStatus } from "utils/constants";
import { getAuth } from "firebase/auth";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getPasswordStatus, useAuthentication } from "./authentication";
import isElectron from "is-electron";
import {
  doesSnapshotMatchStatus,
  getSnapshotBestItem,
  getSubscriptionPrice,
  getSubscriptionPriceId,
  getSubscriptionStatusTag,
  isAtLeastSubscriptionStatus,
} from "utils/subscription";

// ------------------------------------------------------------
// Subscription Types
// ------------------------------------------------------------
interface SubscriptionRank {
  isProdigy: boolean;
  isMaestro: boolean;
  isVirtuoso: boolean;
  isAdmin: boolean;
  isAtLeastStatus: (status: SubscriptionStatus) => boolean;
  isDesktop: boolean;
  isWeb: boolean;
  canPlay: boolean;
}

interface SubscriptionDetails {
  status?: SubscriptionStatus;
  price?: number;
  subscriptionId?: string;
  itemId?: string;
  priceId?: string;
}

// Subscription info storing status, price, etc.
export type SubscriptionInfo = SubscriptionRank & SubscriptionDetails;

// Default subscription info
const DEFAULT_SUBSCRIPTION_INFO: SubscriptionInfo = {
  isProdigy: false,
  isMaestro: false,
  isVirtuoso: false,
  isAdmin: false,
  isAtLeastStatus: () => false,
  isDesktop: isElectron(),
  isWeb: !isElectron(),
  canPlay: false,
};

// Admin subscription info
export const ADMIN_SUBSCRIPTION_INFO: SubscriptionInfo = {
  ...DEFAULT_SUBSCRIPTION_INFO,
  isProdigy: true,
  isMaestro: true,
  isVirtuoso: true,
  isAdmin: true,
  canPlay: true,
  isAtLeastStatus: () => true,
};

// ------------------------------------------------------------
// Subscription Providers
// ------------------------------------------------------------

// Create a context for the subscription info
export const SubscriptionContext = createContext<SubscriptionInfo>(
  DEFAULT_SUBSCRIPTION_INFO
);

// Create a hook for the context
export const useSubscription = () => useContext(SubscriptionContext);

// Provide the subscription info to the app
export const SubscriptionProvider = (props: { children: ReactNode }) => {
  const { user } = useAuthentication();
  const userId = user?.uid;
  const [value, setValue] = useState(
    getPasswordStatus() === "admin"
      ? ADMIN_SUBSCRIPTION_INFO
      : DEFAULT_SUBSCRIPTION_INFO
  );

  // Fetch the subscription status or update the admin status
  useEffect(() => {
    if (getPasswordStatus() === "admin") {
      setValue(ADMIN_SUBSCRIPTION_INFO);
    } else if (userId) {
      const fetchStatus = async () => {
        setValue(await getSubscriptionStatus(userId));
      };
      fetchStatus();
    }
  }, [userId]);

  // Return the subscription provider
  return (
    <SubscriptionContext.Provider value={value}>
      {props.children}
    </SubscriptionContext.Provider>
  );
};

// Await and return the subscription status of the current user from Firestore
export async function getSubscriptionStatus(
  uid?: string
): Promise<SubscriptionInfo> {
  if (getPasswordStatus() === "admin") return ADMIN_SUBSCRIPTION_INFO;

  // Make sure the user is authenticated
  const auth = getAuth(firebaseApp);
  const userId = auth.currentUser?.uid || uid;
  if (!userId) return DEFAULT_SUBSCRIPTION_INFO;

  const db = getFirestore(firebaseApp);
  const ref = collection(db, "customers", userId, "subscriptions");
  const q = query(ref, where("status", "==", "active"));

  // Query the firestore and find the most expensive item if it exists
  const { itemId, subscriptionId } = await new Promise<Record<string, string>>(
    (resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const item = getSnapshotBestItem(snapshot);
        resolve({ itemId: item?.id, subscriptionId: item?.subscription });
        unsubscribe();
      });
    }
  );

  // Check for subscriptions
  const { hasMaestro, hasVirtuoso } = await new Promise<
    Record<string, boolean>
  >((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hasMaestro = doesSnapshotMatchStatus(snapshot, "maestro");
      const hasVirtuoso = doesSnapshotMatchStatus(snapshot, "virtuoso");
      resolve({ hasMaestro, hasVirtuoso });
      unsubscribe();
    });
  });

  // Derive the subscription status
  const isProdigy = !hasMaestro && !hasVirtuoso;
  const isMaestro = hasMaestro && !hasVirtuoso;
  const isVirtuoso = hasVirtuoso;
  const status = getSubscriptionStatusTag({ hasMaestro, hasVirtuoso });
  const priceId = getSubscriptionPriceId(status);

  // Return the subscription status
  return {
    ...DEFAULT_SUBSCRIPTION_INFO,
    subscriptionId,
    itemId,
    priceId,
    isProdigy,
    isMaestro,
    isVirtuoso,
    canPlay: !isElectron() || isVirtuoso,
    isAtLeastStatus: isAtLeastSubscriptionStatus({ hasMaestro, hasVirtuoso }),
  };
}

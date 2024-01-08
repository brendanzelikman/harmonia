import { firebaseApp } from "firebase";
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
import { MAESTRO_PRICE_ID, VIRTUOSO_PRICE_ID } from "utils/constants";
import { doesSnapshotMatchStatus } from "utils/database";
import { useAuthentication } from "./authentication";
import isElectron from "is-electron";

// Subscription info storing status, price, etc.
export interface SubscriptionInfo {
  status?: SubscriptionStatus;
  price?: number;
  subscriptionId?: string;
  itemId?: string;
  priceId?: string;
  isProdigy: boolean;
  isMaestro: boolean;
  isVirtuoso: boolean;
  isAtLeastStatus: (status: SubscriptionStatus) => boolean;
  isDesktop?: boolean;
  isWeb?: boolean;
  canPlay?: boolean;
}

// Default subscription info
const DEFAULT_SUBSCRIPTION_INFO: SubscriptionInfo = {
  isProdigy: false,
  isMaestro: false,
  isVirtuoso: false,
  isAtLeastStatus: () => false,
};

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
  const db = getFirestore(firebaseApp);

  // Update the subscription ID
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>();
  const [itemId, setItemId] = useState<string | undefined>();
  useEffect(() => {
    if (!userId) return;
    const ref = collection(db, "customers", userId, "subscriptions");
    const q = query(ref, where("status", "==", "active"));

    // Attach and remove a listener to the user's subscriptions
    return onSnapshot(q, (snapshot) => {
      const subscriptions = snapshot.docs.map((doc) => doc.data());
      const items = subscriptions.flatMap((s) => s.items);

      // Sort the items by price
      const sortedItems = items.sort((a, b) => b.plan.amount - a.plan.amount);
      const itemCount = sortedItems.length;
      if (!itemCount) return;

      // Get the most expensive item and set the ID
      const currentItem = sortedItems[0];
      setSubscriptionId(currentItem.subscription);
      setItemId(currentItem.id);
    });
  }, [userId]);

  // Check for each subscription
  const [hasMaestro, setHasMaestro] = useState(false);
  const [hasVirtuoso, setHasVirtuoso] = useState(false);
  useEffect(() => {
    if (!userId) return;
    const ref = collection(db, "customers", userId, "subscriptions");
    const q = query(ref, where("status", "==", "active"));

    // Attach and remove a query to the user's subscriptions
    return onSnapshot(q, (snapshot) => {
      const isMaestro = doesSnapshotMatchStatus(snapshot, "maestro");
      const isVirtuoso = doesSnapshotMatchStatus(snapshot, "virtuoso");
      setHasMaestro(isMaestro);
      setHasVirtuoso(isVirtuoso);
    });
  }, [userId]);

  // Create a callback to check if the user has at least a certain subscription status
  const isAtLeastStatus = useCallback(
    (status: SubscriptionStatus) => {
      if (status === "prodigy") return true;
      if (status === "maestro") return hasMaestro || hasVirtuoso;
      if (status === "virtuoso") return hasVirtuoso;
      return false;
    },
    [hasMaestro, hasVirtuoso]
  );

  const isProdigy = !hasMaestro && !hasVirtuoso;
  const isMaestro = hasMaestro && !hasVirtuoso;
  const isVirtuoso = hasVirtuoso;
  const isDesktop = isElectron();
  const isWeb = !isDesktop;
  const canPlay = isWeb || isVirtuoso;

  // Derive additional information from the subscription status
  const status = isVirtuoso ? "virtuoso" : isMaestro ? "maestro" : "prodigy";
  const price = isVirtuoso ? 20 : isMaestro ? 10 : 0;
  const priceId = isVirtuoso
    ? VIRTUOSO_PRICE_ID
    : isMaestro
    ? MAESTRO_PRICE_ID
    : undefined;

  // Collect the subscription info
  const value: SubscriptionInfo = !userId
    ? DEFAULT_SUBSCRIPTION_INFO
    : {
        status,
        price,
        subscriptionId,
        itemId,
        priceId,
        isProdigy,
        isMaestro,
        isVirtuoso,
        isAtLeastStatus,
        isDesktop,
        isWeb,
        canPlay,
      };

  // Return the subscription status
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
  const auth = getAuth(firebaseApp);
  const userId = auth.currentUser?.uid || uid;
  const db = getFirestore(firebaseApp);
  if (!userId) return DEFAULT_SUBSCRIPTION_INFO;

  // Get the subscription ID
  const ref = collection(db, "customers", userId, "subscriptions");
  const q = query(ref, where("status", "==", "active"));
  const { itemId, subscriptionId } = await new Promise<Record<string, string>>(
    (resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subscriptions = snapshot.docs.map((doc) => doc.data());
        const items = subscriptions.flatMap((s) => s.items);

        // Sort the items by price
        const sortedItems = items.sort((a, b) => b.plan.amount - a.plan.amount);

        // Get the most expensive item and resolve with the ID
        const currentItem = sortedItems[0];
        resolve({
          itemId: currentItem?.id,
          subscriptionId: currentItem?.subscription,
        });
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

  const isProdigy = !hasMaestro && !hasVirtuoso;
  const isMaestro = hasMaestro && !hasVirtuoso;
  const isVirtuoso = hasVirtuoso;

  // Get the current price ID
  const priceId = isVirtuoso
    ? VIRTUOSO_PRICE_ID
    : isMaestro
    ? MAESTRO_PRICE_ID
    : undefined;

  // Return the subscription status
  return {
    subscriptionId,
    itemId,
    priceId,
    isProdigy,
    isMaestro,
    isVirtuoso,
    isAtLeastStatus: (status: SubscriptionStatus) => {
      if (status === "prodigy") return isProdigy;
      if (status === "maestro") return hasMaestro && !hasVirtuoso;
      if (status === "virtuoso") return hasVirtuoso;
      return false;
    },
  };
}

import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { PRICE_RECORD, Rank, WEBSITE_URL } from "../utils/constants";
import { firebaseApp, FirebaseApp } from "providers/firebase";

/* Get the checkout URL for the given subscription status. */
export const getCheckoutUrl = async (
  app: FirebaseApp,
  status: Rank
): Promise<string> => {
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Get the current user ID
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User is not authenticated.");

  // Get the corresponding price
  const price = PRICE_RECORD[status];
  if (!price) throw new Error("Invalid subscription status.");

  // Add a new checkout session
  const checkoutRef = collection(db, "customers", userId, "checkout_sessions");
  const docRef = await addDoc(checkoutRef, {
    price,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });

  // Resolve with the URL or error
  return new Promise<string>((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data() as {
        error?: { message: string };
        url?: string;
      };
      if (error) {
        unsubscribe();
        reject(error.message);
      }
      if (url) {
        unsubscribe();
        resolve(url);
      }
    });
  });
};

/* Get the portal URL to manage subscriptions with a custom flow based on status. */
export const getPortalUrl = async (
  app: FirebaseApp,
  status?: Rank
): Promise<string> => {
  let dataWithUrl: any;
  try {
    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User is not authenticated.");

    const db = getFirestore(firebaseApp);
    const ref = collection(db, "customers", userId, "subscriptions");
    const q = query(ref, where("status", "==", "active"));

    // Query the firestore and find the most expensive item if it exists
    const { itemId, subscriptionId } = await new Promise<
      Record<string, string>
    >((resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subscriptions = snapshot.docs.map((doc) => doc.data());
        const items = subscriptions.flatMap((s) => s.items);
        const item = items.sort((a, b) => b.plan.amount - a.plan.amount)[0];
        resolve({ itemId: item?.id, subscriptionId: item?.subscription });
        unsubscribe();
      });
    });

    // Prepare the cloudless function
    const functions = getFunctions(app, "us-east1");
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );

    // Create the corresponding flow data
    const flow_data = !status
      ? undefined
      : status === "prodigy"
      ? {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: subscriptionId,
          },
        }
      : {
          type: "subscription_update_confirm",
          subscription_update_confirm: {
            subscription: subscriptionId,
            items: [{ id: itemId, price: PRICE_RECORD[status], quantity: 1 }],
          },
        };

    // Make sure the user is routed to the web
    const returnUrl =
      window.location.protocol === "file:"
        ? WEBSITE_URL
        : window.location.origin;

    // Call the function
    const { data } = await functionRef({
      returnUrl,
      flow_data,
    });

    // Get the URL from the response
    dataWithUrl = data as { url: string };
  } catch (error) {
    console.log(error);
  }

  // Resolve the promise with the URL
  return new Promise<string>((resolve, reject) => {
    if (dataWithUrl) {
      resolve(dataWithUrl.url);
    } else {
      reject("Error creating portal link.");
    }
  });
};

import {
  QuerySnapshot,
  DocumentData,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "providers/firebase";
import { getClearance, adminClearance } from "providers/auth/password";
import { Rank, MAESTRO_PRICE_ID, VIRTUOSO_PRICE_ID } from "utils/constants";

// Await and return the subscription status of the current user from Firestore
export async function fetchRank(uid: string | null): Promise<Rank> {
  if (getClearance() === adminClearance) return "virtuoso";

  // Make sure the user is authenticated
  const auth = getAuth(firebaseApp);
  const userId = auth.currentUser?.uid || uid;
  if (!userId) return "prodigy";

  const db = getFirestore(firebaseApp);
  const ref = collection(db, "customers", userId, "subscriptions");
  const q = query(ref, where("status", "==", "active"));

  // Check for subscriptions
  return await new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hasMaestro = doesSnapshotMatchRank(snapshot, "maestro");
      const hasVirtuoso = doesSnapshotMatchRank(snapshot, "virtuoso");
      if (hasVirtuoso) return resolve("virtuoso");
      if (hasMaestro) return resolve("maestro");
      resolve("prodigy");

      unsubscribe();
    });
  });
}

// Return whether the snapshot matches the given status.
export const doesSnapshotMatchRank = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
  status: Rank
) => {
  if (status === "prodigy") return !snapshot.empty;
  const priceId = status === "maestro" ? MAESTRO_PRICE_ID : VIRTUOSO_PRICE_ID;
  const hasPriceId = (doc: DocumentData) => {
    const data = doc.data();
    const hasPrice = (i: any) => i.price.id === priceId;
    return data.items.some(hasPrice);
  };
  return !snapshot.empty && snapshot.docs.some(hasPriceId);
};

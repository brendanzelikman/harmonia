import { QuerySnapshot, DocumentData } from "firebase/firestore";
import {
  MAESTRO_PRICE_ID,
  SubscriptionStatus,
  VIRTUOSO_PRICE_ID,
} from "./constants";

//* Check if a Firestore snapshot matches a subscription status. */
export const doesSnapshotMatchStatus = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
  status: SubscriptionStatus
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

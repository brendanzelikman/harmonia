import { QuerySnapshot, DocumentData } from "firebase/firestore";
import {
  MAESTRO_PRICE,
  MAESTRO_PRICE_ID,
  PRODIGY_PRICE,
  SubscriptionStatus,
  VIRTUOSO_PRICE,
  VIRTUOSO_PRICE_ID,
} from "./constants";

// Return the subscription status based on the user's subscription items.
export const getSubscriptionStatusTag = (props: {
  hasMaestro: boolean;
  hasVirtuoso: boolean;
}): SubscriptionStatus => {
  if (props.hasMaestro) return "maestro";
  if (props.hasVirtuoso) return "virtuoso";
  return "prodigy";
};

// Return the price for the given subscription status.
export const getSubscriptionPrice = (status: SubscriptionStatus) => {
  if (status === "maestro") return MAESTRO_PRICE;
  if (status === "virtuoso") return VIRTUOSO_PRICE;
  return PRODIGY_PRICE;
};

// Return the price ID for the given subscription status.
export const getSubscriptionPriceId = (status: SubscriptionStatus) => {
  if (status === "maestro") return MAESTRO_PRICE_ID;
  if (status === "virtuoso") return VIRTUOSO_PRICE_ID;
  return undefined;
};

// Return the most expensive item from the snapshot.
export const getSnapshotBestItem = (
  snapshot: QuerySnapshot<DocumentData, DocumentData>
) => {
  const subscriptions = snapshot.docs.map((doc) => doc.data());
  const items = subscriptions.flatMap((s) => s.items);
  const sortedItems = items.sort((a, b) => b.plan.amount - a.plan.amount);
  return sortedItems[0];
};

// Return whether the snapshot matches the given status.
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

// Return whether the user has a subscription status.
export const isAtLeastSubscriptionStatus =
  (props: { hasMaestro: boolean; hasVirtuoso: boolean }) =>
  (status: SubscriptionStatus) => {
    if (status === "prodigy") return true;
    if (status === "maestro") return props.hasMaestro || props.hasVirtuoso;
    if (status === "virtuoso") return props.hasVirtuoso;
    return false;
  };

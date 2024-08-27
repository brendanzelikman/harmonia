import { getSubscriptionStatus } from "providers/subscription";
import {
  PROJECT_STORE,
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/constants";
import { getUserDatabase } from "./database";

// ------------------------------------------------------------
// Database Projects
// ------------------------------------------------------------
/** Get a boolean indicating whether a user has reached their maximum projects */

export const hasReachedProjectLimit = async (uid: string): Promise<boolean> => {
  const subscription = await getSubscriptionStatus(uid);
  const { isProdigy, isMaestro, isVirtuoso, isAdmin } = subscription;

  // Bypass admins
  if (isAdmin) return false;

  // Otherwise, get the user's projects
  const db = await getUserDatabase(uid);
  const projects = await db.getAll(PROJECT_STORE);
  const projectCount = projects.length;

  // Check the different tiers
  if (isProdigy && projectCount >= PRODIGY_PROJECT_LIMIT) return true;
  if (isMaestro && projectCount >= MAESTRO_PROJECT_LIMIT) return true;
  if (isVirtuoso && projectCount >= VIRTUOSO_PROJECT_LIMIT) return true;
  return false;
};

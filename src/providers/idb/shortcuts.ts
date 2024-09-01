import { SHORTCUT_STORE } from "utils/constants";
import { getDatabase } from "./database";

export type Shortcut = { id: string; name: string; keys: string[] };

export const getShortcutsFromDB = async (uid: string) => {
  const db = getDatabase();
  if (db) return db.getAll(SHORTCUT_STORE);
};

export const addShortcutToDB = async (uid: string, shortcut: Shortcut) => {
  const db = getDatabase();
  if (db) await db.add(SHORTCUT_STORE, shortcut);
};

export const removeShortcutFromDB = async (uid: string, id: string) => {
  const db = getDatabase();
  if (db) await db.delete(SHORTCUT_STORE, id);
};

export const clearShortcutsFromDB = async (uid: string) => {
  const db = getDatabase();
  if (db) await db.clear(SHORTCUT_STORE);
};

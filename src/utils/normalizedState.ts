import { isPlainObject, isString } from "lodash";
import { ID } from "types/units";
import {
  areObjectKeysTyped,
  areObjectValuesTyped,
  isTypedArray,
} from "types/util";
import { createMap } from "./objects";

// ------------------------------------------------------------
// Normalized Type Definitions
// ------------------------------------------------------------

/** A normal object has any keys along with an ID */
export type NormalObject = { [key: string]: any; id: ID };

/** A normal record stores objects containing the keys as IDs */
export type NormalRecord<
  K extends ID = ID,
  V extends NormalObject = NormalObject
> = Record<K, V>;

export type KeyOf<R extends NormalRecord> = keyof R;
export type ValueOf<R extends NormalRecord> = R[KeyOf<R>];

/** A normal state contains a list of IDs and a record of objects containing their IDs. */
export interface NormalState<T extends NormalRecord = NormalRecord> {
  byId: T;
  allIds: ID[];
}

// ------------------------------------------------------------
// Normalized Type Initialization
// ------------------------------------------------------------

/** Create a normal state with a NormalRecord type or a pair of ID and NormalObject types. */

// Overload #1: NormalRecord
export function createNormalState<R extends NormalRecord>(
  initialValues?: ValueOf<R>[]
): NormalState<R>;

// Overload #2: ID and NormalObject
export function createNormalState<K extends ID, V extends NormalObject>(
  initialValues?: V[]
): NormalState<NormalRecord<K, V>>;

// Implementation
export function createNormalState<K extends ID, V extends NormalObject>(
  initialValues?: V[]
): NormalState<NormalRecord<K, V>> {
  if (!initialValues) return { byId: {} as NormalRecord<K, V>, allIds: [] };
  const allIds = initialValues.map((value) => value.id) ?? [];
  const byId = createMap<Record<K, V>>(initialValues);
  return { byId, allIds };
}

// ------------------------------------------------------------
// Normalized Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `NormalObject` */
export const isNormalObject = <T extends NormalObject>(
  obj: unknown
): obj is T => {
  const candidate = obj as NormalObject;
  return isPlainObject(candidate) && isString(candidate.id);
};

/** Checks if a given object is of type `NormalRecord` */
export const isNormalRecord = <K extends ID, V extends NormalObject>(
  obj: unknown,
  isObj?: (obj: unknown) => obj is V
): obj is NormalRecord<K, V> => {
  const candidate = obj as NormalRecord<K, V>;
  return (
    isPlainObject(candidate) &&
    areObjectKeysTyped(candidate, isString) &&
    areObjectValuesTyped(candidate, isObj || isNormalObject)
  );
};

/** Checks if a given object is of type `NormalState` */
export const isNormalState = <K extends ID, V extends NormalObject>(
  obj: unknown,
  isObj?: (obj: unknown) => obj is V
): obj is NormalState<NormalRecord<K, V>> => {
  const candidate = obj as NormalState<NormalRecord<K, V>>;
  return (
    isPlainObject(candidate) &&
    isNormalRecord(candidate.byId, isObj) &&
    isTypedArray(candidate.allIds, isString)
  );
};

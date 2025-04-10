/** Get an object from a record by key or return undefined. */
export const getValueByKey = <T, K extends keyof T>(obj?: T, key?: K) => {
  return key === undefined ? undefined : obj?.[key];
};

/** Get a properly typed array from a record by key or return an empty array. */
export const getArrayByKey = <
  T extends Record<string, S>,
  S extends any = NonNullable<T[keyof T]>
>(
  obj?: T,
  key?: keyof T
) => {
  if (obj === undefined || obj === null) return [] as NonNullable<S>;
  if (key === undefined || key === null) return [] as NonNullable<S>;
  const value = obj?.[key];
  if (value === undefined || value === null) return [] as NonNullable<S>;
  return value as NonNullable<S>;
};

/** Get an array of objects from a record using the given keys. */
export const getValuesByKeys = <T, K extends keyof T>(obj: T, keys: K[]) => {
  return keys
    .map((key) => getValueByKey(obj, key))
    .filter(Boolean) as NonNullable<T[K]>[];
};

/** Pick a key from an object using a record of weights */
export const pickKeyByWeight = <T extends Record<string, number>>(
  weights: T
): keyof T => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (const key in weights) {
    random -= weights[key];
    if (random <= 0) return key;
  }
  return Object.keys(weights)[0];
};

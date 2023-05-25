import * as v8 from 'v8';

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

const absurd = <T>(_: never): T => {
  throw new Error('absurd');
};


const mergeObjects = <A,B>(a: A, b: B) => {
  const cleaned = Object.fromEntries(Object.entries(b).filter(([_, v]) => v !== null))
  return {...a, ...cleaned}
};

export const commonUtils = {
  structuredClone,
  absurd,
  mergeObjects
};


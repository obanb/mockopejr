import * as v8 from 'v8';

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

const absurd = <T>(_: never): T => {
  throw new Error('absurd');
};

export const utils = {
  structuredClone,
  absurd,
};

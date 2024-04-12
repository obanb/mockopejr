const _new = (start: number) => {
  let count = start;
  return {
    inc: () => {
      count++;
      return count;
    },
    dec: () => {
      count--;
      return count;
    },
    get: () => count,
    clear: () => (count = start),
  };
};

const counters = () => {
  let holder: Record<string, ReturnType<typeof _new>> = {};
  return {
    add: (id: string, start: number) => (holder[id] = _new(start)),
    get: (id: string) => holder[id],
    clear: () => (holder = {}),
    delete: (id: string) => delete holder[id],
  };
};

export const counter = {
  counters,
};
export type Counter = typeof counter;

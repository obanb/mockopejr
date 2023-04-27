export const colourfulUnicorn = {
  error: (msg: string) => {
    console.log('\x1b[31m%s\x1b[0m', msg);
  },
  info: (msg: string) => {
    console.log('\x1b[36m%s\x1b[0m', msg);
  },
  warn: (msg: string) => {
    console.log('\x1b[43m%s\x1b[0m', msg);
  },
  debug: (msg: string) => {
    console.log(msg);
  },
  prettyJson: (json: Record<string, unknown>, borderLenFixed = true) => {
    const len = borderLenFixed
      ? 20
      : Object.entries(json).reduce((acu, next) => {
        const l = next[0] + JSON.stringify(next[1]);
        if (acu > l.length) {
          return acu;
        }
        return l.length;
      }, 0);
    console.log('*'.repeat(len));
    console.log('\x1b[36m%s\x1b[0m', JSON.stringify(json, null, 2));
    console.log('*'.repeat(len));
  },
};

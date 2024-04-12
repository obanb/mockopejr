export const colourfulUnicorn = {
  error: (msg: string) => {
    emptyLine()
    console.log('\x1b[31m%s\x1b[0m', msg);
    emptyLine()
  },
  info: (msg: string) => {
    emptyLine()
    console.log('\x1b[36m%s\x1b[0m', msg);
    emptyLine()
  },
  warn: (msg: string) => {
    emptyLine()
    console.log('\x1b[43m%s\x1b[0m', msg);
    emptyLine()
  },
  debug: (msg: string) => {
    emptyLine()
    console.log(msg);
    emptyLine()
  },
  prettyJson: (json: Record<string, unknown> | unknown[], borderLenFixed = true, prefix: string = null) => {
    const borderLinePadding = 3
    const len = borderLenFixed
      ? 20
      : Object.entries(json).reduce((acu, next) => {
        const l = next[0] + JSON.stringify(next[1]);
        if (acu > l.length) {
          return acu;
        }
        return l.length + borderLinePadding
      }, 0);
    const addPrefix = prefix ? prefix + ': ' : '';
    emptyLine()
    console.log('*'.repeat(len));
    console.log('\x1b[36m%s\x1b[0m', addPrefix + JSON.stringify(json, null, 2));
    console.log('*'.repeat(len));
    emptyLine()
  },
};

const emptyLine = () => {
  console.log("")
}

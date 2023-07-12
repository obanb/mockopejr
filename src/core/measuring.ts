
const instance = () => {
  const m = {
    start: 0,
    end: 0,
    duration: 0,
    requests: 0,
    avg: 0,
    ok: 0,
    error: 0,
    slowest: 40,
    fastest: 10,
  };

  return {
    start() {
      m.start = Date.now();
    },
    inc: (status, duration) => {
      m.requests += 1;

      if (m.slowest < duration || m.slowest === 0) {
        m.slowest = duration;
      }

      if (m.fastest > duration || m.fastest === 0) {
        m.fastest = duration;
      }

      if (status < 400) {
        m.ok += 1;
      } else {
        m.error += 1;
      }
    },
    update(key, value) {
      m[key] = value;
    },
    close() {
      m.end = Date.now();
      m.duration = m.end - m.start;
      m.avg = m.duration / m.requests;
      return m;
    },
  };
};

export const measuring = {
  new: instance,
}

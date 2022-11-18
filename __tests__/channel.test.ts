import { channel } from '../src/channel.js';
import { ChannelOptions, CmdType } from '../src/types.js';

jest.useFakeTimers();

describe('channel tests', () => {
  it('shoud test async generator with interval fn', async () => {
    const totalTimeMs = 4000;
    const jestFn = jest.fn();

    const callbackFn = () => {
      jestFn();
      return Promise.resolve();
    };

    const opts: ChannelOptions = {
      callbackFn,
    };

    const chan = channel.new(opts);

    const s1 = await chan.init();
    expect(s1.done).toBe(false);
    expect(s1.value).toEqual({ type: CmdType.PAUSE });

    // generator has been initialized, but the callback has not yet run
    expect(jestFn).not.toBeCalled();

    // after the next call the next interval started
    const s2 = await chan.next({ type: CmdType.RUN });

    // w8 for intervals
    jest.advanceTimersByTime(totalTimeMs);

    expect(jestFn).toBeCalled();
    expect(jestFn).toHaveBeenCalledTimes(totalTimeMs / 1000);

    expect(s2.done).toBe(false);

    const s3 = await chan.next({ type: CmdType.KILL });

    expect(s3.done).toBe(true);

    expect(jestFn).toBeCalled();

    expect(1).toBe(1);
  }),
    it('shoud test two async generators with interval fns', async () => {
      const totalTimeMs = 4000;
      const jestFnA = jest.fn();
      const jestFnB = jest.fn();
      const jestFnAB = jest.fn();
      const jestFnBetween = jest.fn();

      const callbackFnA = () => {
        jestFnA();
        jestFnAB();
        return Promise.resolve();
      };

      const callbackFnB = () => {
        jestFnB();
        jestFnAB();
        return Promise.resolve();
      };

      const optsA: ChannelOptions = {
        callbackFn: callbackFnA,
      };

      const optsB: ChannelOptions = {
        callbackFn: callbackFnB,
      };

      const chanA = channel.new(optsA);
      const chanB = channel.new(optsB);

      const s1A = await chanA.init();
      const s1b = await chanB.init();

      expect(s1A.done).toBe(false);
      expect(s1A.done).toBe(false);
      expect(s1b.value).toEqual({ type: CmdType.PAUSE });
      expect(s1b.value).toEqual({ type: CmdType.PAUSE });

      // generator has been initialized, but the callback has not yet run
      expect(jestFnA).not.toBeCalled();
      expect(jestFnB).not.toBeCalled();

      // after the next call the next interval started
      const s2A = await chanA.next({
        type: CmdType.RUN,
        options: {
          perSec: 1,
          url: 'effe',
          buffer: 1,
        },
      });
      const s2B = await chanB.next({
        type: CmdType.RUN,
        options: {
          perSec: 1,
          url: 'effe',
          buffer: 1,
        },
      });

      jestFnBetween();
      // just in case
      expect(jestFnBetween).toBeCalled();

      // w8 for intervals
      jest.advanceTimersByTime(totalTimeMs);

      expect(jestFnA).toBeCalled();
      expect(jestFnB).toBeCalled();
      expect(jestFnAB).toBeCalled();
      expect(jestFnA).toHaveBeenCalledTimes(totalTimeMs / 1000);
      expect(jestFnB).toHaveBeenCalledTimes(totalTimeMs / 1000);

      // 2x generator interval (4000ms / 1000) * generator interval callback call
      expect(jestFnAB).toHaveBeenCalledTimes((totalTimeMs / 1000) * 2);

      expect(s2A.done).toBe(false);
      expect(s2B.done).toBe(false);

      const s3A = await chanA.next({ type: CmdType.KILL });
      const s3B = await chanB.next({ type: CmdType.KILL });

      expect(s3A.done).toBe(true);
      expect(s3B.done).toBe(true);
    });
});

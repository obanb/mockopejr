import { routing } from '../src/routing.js';
import { channel, ChannelOptions } from '../src/channel.js';
jest.useFakeTimers();

describe('http & routing tests', () => {
  it('should test url path get from url string', () => {
    expect(routing.getUrlPath('http://localhost:8080/path1/path2')).toBe(
      '/path1/path2',
    );
    expect(routing.getUrlPath('http://localhost:8080/')).toBe('/');
    expect(routing.getUrlPath('http://localhost:8080')).toBe('/');
    expect(routing.getUrlPath('http://localhost:8080/path1?arg1=2')).toBe(
      '/path1',
    );
  }),
    it('should test url query params get from url path string', () => {
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2')[0],
      ).toBe('arg1=2');
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[0],
      ).toBe('arg1=2');
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[1],
      ).toBe('arg2=3');
    }),
    it('should test url query params convert to key/value pair map', () => {
      const queries = [['arg1=2'], ['arg1=2', 'arg2=3']];
      expect(routing.getQueryParamsPairs(queries[0])).toEqual({ arg1: '2' });
      expect(routing.getQueryParamsPairs(queries[1])).toEqual({
        arg1: '2',
        arg2: '3',
      });
    });

  it('shoud test async generator with interval fn', async () => {
    const totalTimeMs = 4000;
    const jestFn = jest.fn();

    const callbackFn = () => {
      jestFn();
      return Promise.resolve();
    };

    const opts: ChannelOptions = {
      perSec: 1,
      callbackFn,
    };

    const chan = channel.new(opts);

    const s1 = await chan.init;
    expect(s1.done).toBe(false);
    expect(s1.value).toEqual({ cmd: 'idle' });

    // generator has been initialized, but the callback has not yet run
    expect(jestFn).not.toBeCalled();

    // after the next call the next interval started
    const s2 = await chan.next({ cmd: 'run', options: opts });

    // w8 for intervals
    jest.advanceTimersByTime(totalTimeMs);

    expect(jestFn).toBeCalled();
    expect(jestFn).toHaveBeenCalledTimes(totalTimeMs / (1000 * opts.perSec));

    expect(s2.done).toBe(false);

    const s3 = await chan.next({ cmd: 'kill' });

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
        perSec: 1,
        callbackFn: callbackFnA,
      };

      const optsB: ChannelOptions = {
        perSec: 1,
        callbackFn: callbackFnB,
      };

      const chanA = channel.new(optsA);
      const chanB = channel.new(optsB);

      const s1A = await chanA.init;
      const s1b = await chanB.init;

      expect(s1A.done).toBe(false);
      expect(s1A.done).toBe(false);
      expect(s1b.value).toEqual({ cmd: 'idle' });
      expect(s1b.value).toEqual({ cmd: 'idle' });

      // generator has been initialized, but the callback has not yet run
      expect(jestFnA).not.toBeCalled();
      expect(jestFnB).not.toBeCalled();

      // after the next call the next interval started
      const s2A = await chanA.next({ cmd: 'run', options: optsA });
      const s2B = await chanB.next({ cmd: 'run', options: optsB });

      jestFnBetween();
      // just in case
      expect(jestFnBetween).toBeCalled();

      // w8 for intervals
      jest.advanceTimersByTime(totalTimeMs);

      expect(jestFnA).toBeCalled();
      expect(jestFnB).toBeCalled();
      expect(jestFnAB).toBeCalled();
      expect(jestFnA).toHaveBeenCalledTimes(
        totalTimeMs / (1000 * optsA.perSec),
      );
      expect(jestFnB).toHaveBeenCalledTimes(
        totalTimeMs / (1000 * optsB.perSec),
      );

      // 2x generator interval (4000ms / 1000) * generator interval callback call
      expect(jestFnAB).toHaveBeenCalledTimes(
        (totalTimeMs / (1000 * optsB.perSec)) * 2,
      );

      expect(s2A.done).toBe(false);
      expect(s2B.done).toBe(false);

      const s3A = await chanA.next({ cmd: 'kill' });
      const s3B = await chanB.next({ cmd: 'kill' });

      expect(s3A.done).toBe(true);
      expect(s3B.done).toBe(true);
    }),
    it('txt', async () => {});
});

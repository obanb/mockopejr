import { routing } from '../src/routing.js';

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
});

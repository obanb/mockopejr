import { getUrlPath, getQueryParams, getQueryParamsPairs } from '../src/main.js';

describe('greeter function', () => {
  it("should test url path get from url string", () => {
    expect(getUrlPath('http://localhost:8080/path1/path2')).toBe('/path1/path2');
    expect(getUrlPath('http://localhost:8080/')).toBe('/');
    expect(getUrlPath('http://localhost:8080')).toBe('/');
    expect(getUrlPath('http://localhost:8080/path1?arg1=2')).toBe('/path1');
  }),
  it("should test url query params get from url path string", () => {
    expect(getQueryParams('http://localhost:8080/path1?arg1=2')[0]).toBe("arg1=2");
    expect(getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[0]).toBe("arg1=2");
    expect(getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[1]).toBe("arg2=3");
  }),
  it("should test url query params convert to key/value pair map", () => {
    const queries = [
      ["arg1=2"],
      ["arg1=2", "arg2=3"]
    ]
    expect(getQueryParamsPairs(queries[0])).toEqual({arg1:'2'});
    expect(getQueryParamsPairs(queries[1])).toEqual({arg1:'2', arg2: '3'});
  })

  it("bb",() => {
    function* questionGenerator(): Generator<string, unknown, string> {
      let state = 'idle';
      const t = setInterval(() => {
          console.log(state)
          if (state === 'run') {
              console.log('bezim')
          }
      }, 1000)
      while (true) {
        console.log('true')
        if (state === 'stop') {
          clearInterval(t)
          break
        }
        state = yield state
      }
      return
    }
    const test = questionGenerator()
    test.next()
    test.next('run')

    setInterval(() => {
      test.next('stop')
    }, 1)

    expect(1).toBe(1);
  })
});

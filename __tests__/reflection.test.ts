import  * as json  from './reflection_test.json';
import { reflection } from '../src/reflection.js';

describe('reflection, generator & Logr expression lang tests', () => {
  it('should recursively generate data based on JSON primitive types and Logr expression language', async() => {
    const f = json
    const p = reflection.reflectAndGenerate(f)
    console.log(f)
    console.log(p)
         expect(1).toEqual(json)
  })
})

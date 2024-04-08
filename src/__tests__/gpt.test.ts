
// test meant as a playground, not continuous integration

import { templates } from '../gpt/templates.js';

jest.setTimeout(100000)

describe('GPT playground', () => {
  it('generate json with default template', async() => {


    const json = await templates.similirizeJson({a: "Prague", b: "Želivského 805", c: "Letadlo"},"make propert c type of fighter jet" );

    // const test = await Promise.all(Array.from({length: 10}).map(async() => {
    //    return templates.generateJSON({a: "Prague", b: "Želivského 805", c: "Letadlo"}, );
    // }))

    console.log(json)
    expect(test).toBeDefined()

    expect(json).toBeDefined()
  });
  it('generate json with default 2 template', async() => {


    const json = await templates.createValue("get me random number between 55 - 66", 'typescript number at string');

    // const test = await Promise.all(Array.from({length: 10}).map(async() => {
    //    return templates.generateJSON({a: "Prague", b: "Želivského 805", c: "Letadlo"}, );
    // }))

    console.log(json)

    expect(test).toBeDefined()

    expect(json).toBeDefined()
  });
});

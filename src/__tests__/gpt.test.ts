
// test meant as a playground, not continuous integration

import { templates } from '../gpt/templates.js';

jest.setTimeout(100000)

describe('GPT playground', () => {
  it('generate json with default template', async() => {

    const json = await templates.generateJSON([{a: "Prague", b: "Želivského 805", c: "Letadlo"},{a: "Praha", b: "5th Avenue", c: "Ship"},] );

    // const test = await Promise.all(Array.from({length: 10}).map(async() => {
    //    return templates.generateJSON({a: "Prague", b: "Želivského 805", c: "Letadlo"}, );
    // }))

    expect(test).toBeDefined()

    expect(json).toBeDefined()
  });
});

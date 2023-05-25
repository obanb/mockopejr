import { templates } from '../gpt/templates.js';

describe('empty test', () => {
  it('should run empty test', async() => {

    const pes = await templates.generateJSON({a: 1, b: 2, c: 3});
    expect(pes).toBe(true);
    expect(true).toBe(true);
  });
});

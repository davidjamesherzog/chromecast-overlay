import overlays from './main.js';

describe('overlays', () => {
  it('overlays(string)', () => {
    expect(overlays('cool')).toMatchSnapshot();
  });
});

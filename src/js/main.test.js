import Overlay from './overlay.js';
import overlays from './main.js';

jest.mock('./overlay.js'); // Overlay is now a mock constructor

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  Overlay.mockClear();
  Object.defineProperty(global.document, 'getElementsByClassName', {
    value: () => {
      return [
        {
          appendChild: jest.fn()
        }
      ]
    }
  });
});

describe('main', () => {

  test('should define overlays', () => {
    let overlays_ = overlays({overlays: [{
      id: 'play-info',
      start: cast.framework.events.EventType.PLAY,
      end: cast.framework.events.EventType.PAUSE,
      align: 'top-left'
    }]});
    expect(overlays_).toBeDefined();
    expect(overlays_.length).toEqual(1);
    expect(Overlay).toHaveBeenCalledTimes(1);
    expect(Overlay).toHaveBeenCalledWith(cast.framework.CastReceiverContext.getInstance().getPlayerManager(), {
      id: 'play-info',
      start: cast.framework.events.EventType.PLAY,
      end: cast.framework.events.EventType.PAUSE,
      align: 'top-left',
      class: '',
      content: 'This overlay will show up while the video is playing',
      debug: false,
      showBackground: true
    });
    expect(Overlay.mock.instances[0].createEl).toHaveBeenCalledTimes(1);
    expect(Overlay.mock.instances[0].el).toHaveBeenCalledTimes(1);
  });


});

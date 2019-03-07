import { JSDOM } from "jsdom";

const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;

// chromecast
global.cast = {
  framework: {
    events: {
      EventType: {
        PLAY: 'play',
        PAUSE: 'pause'
      }
    },
    CastReceiverContext: {
      getInstance: () => {
        return {
          getPlayerManager: () => {
            return;
          }
        };
      }
    }
  }
};

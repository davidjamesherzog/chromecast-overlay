import Overlay from './overlay.js';

let overlay;

describe('overlay', () => {

  let player;
  let options;

  beforeEach(() => {
    player = {
      addEventListener: jest.fn()
    };
    options = {};
  });

  describe('constructor', () => {

    test('should set time update', () => {
      options.start = 1;
      overlay = new Overlay(player, options);
      expect(overlay['startEvent_']).toEqual(cast.framework.events.EventType.TIME_UPDATE);
    });

    test('should set player event', () => {
      options.start = cast.framework.events.EventType.PLAY;
      overlay = new Overlay(player, options);
      expect(overlay['startEvent_']).toEqual(cast.framework.events.EventType.PLAY);
    });

    test('should throw error if no start event', () => {
      try {
        overlay = new Overlay(player, options);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e.message).toEqual('invalid "start" option; expected number or string');
      }
    });

  });

  describe('functions', () => {

    beforeEach(() => {
      const player = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getCurrentTimeSec: jest.fn().mockImplementation(() => 50)
      };
      const options = {
        start: 'play'
      };
      overlay = new Overlay(player, options);
    });

    describe('createEl', () => {

      beforeEach(() => {
        document.appendContent = jest.fn();
        jest.spyOn(document, 'getElementById').mockImplementation(id => id);
        jest.spyOn(document, 'createElement').mockImplementation(() => {
          return {
            appendChild: jest.fn(),
            innerHTML: '',
            appendContent: jest.fn()
          };
        });

      });

      test('should set className with background', () => {
        overlay.options_ = {
          id: 'test',
          showBackground: true,
          align: 'top',
          class: 'test'
        };
        overlay.createEl();
        expect(overlay.el_.className).toEqual('chromecast-overlay chromecast-overlay-top test chromecast-overlay-background chromecast-hidden');
      });

      test('should set className with no background', () => {
        overlay.options_ = {
          id: 'test',
          showBackground: false,
          align: 'top',
          class: 'test'
        };
        overlay.createEl();
        expect(overlay.el_.className).toEqual('chromecast-overlay chromecast-overlay-top test chromecast-overlay-no-background chromecast-hidden');
      });

      test('should create el_ based on id', () => {
        overlay.options_ = {
          id: 'test'
        };
        overlay.createEl();
        expect(overlay.el_.appendChild).toHaveBeenCalledWith('test');
        expect(document.getElementById).toHaveBeenCalledWith('test');
        expect(document.appendContent).not.toHaveBeenCalled();
        expect(overlay.el_.innerHTML).toEqual('');
      });

      test('should create el_ based on a string', () => {
        overlay.options_ = {
          content: 'test string'
        };
        overlay.createEl();
        expect(overlay.el_.appendChild).not.toHaveBeenCalled();
        expect(document.appendContent).not.toHaveBeenCalled();
        expect(overlay.el_.innerHTML).toEqual('test string');
      });

      test('should create el_ based on a document fragment', () => {
        overlay.options_ = {
          content: new DocumentFragment()
        };
        overlay.createEl();
        expect(overlay.el_.appendChild).toHaveBeenCalledWith(overlay.options_.content);
        expect(document.appendContent).not.toHaveBeenCalled();
        expect(overlay.el_.innerHTML).toEqual('');
      });

      test('should create el_ based on content', () => {
        overlay.options_ = {
          content: {}
        };
        overlay.createEl();
        expect(overlay.el_.appendChild).not.toHaveBeenCalled();
        expect(document.appendContent).toHaveBeenCalledWith(overlay.el_, {});
        expect(overlay.el_.innerHTML).toEqual('');
      });

      test('should call onReady function', () => {
        overlay.options_ = {
          id: 'test',
          onReady: jest.fn()
        };
        overlay.createEl();
        expect(overlay.el_.appendChild).toHaveBeenCalledWith('test');
        expect(document.getElementById).toHaveBeenCalledWith('test');
        expect(overlay.options_.onReady).toHaveBeenCalled();
      });

    });

    describe('el', () => {

      test('should return el_', () => {
        overlay.el_ = '<div></div>';
        const value = overlay.el();
        expect(value).toEqual(overlay.el_);
      });

    });

    describe('debug', () => {

      beforeEach(() => {
        jest.spyOn(window.console, 'debug');
      });

      test('should return and do nothing', () => {
        overlay.debug('test');
        expect(window.console.debug).not.toHaveBeenCalled();
      });

      test('should call window.console.log', () => {
        overlay.options_.debug = true;
        overlay.id = 'overlay-id';
        overlay.debug('test');
        expect(window.console.debug).toHaveBeenCalledWith('overlay#overlay-id: ', 'test');
      });

    });

    describe('hide', () => {

      beforeEach(() => {
        jest.spyOn(overlay, 'debug').mockImplementation(() => {});
        overlay.el_ = {
          classList: {
            add: jest.fn()
          }
        };
        overlay.startEvent_ = 'pause';
        overlay.hidden = false;
      });

      test('should add class and event listener', () => {
        overlay.endEvent_ = 'play';
        overlay.hide();
        expect(overlay.el_.classList.add).toHaveBeenCalledWith('chromecast-hidden');
        expect(overlay.debug).toHaveBeenCalledWith('hidden');
        expect(overlay.debug).toHaveBeenCalledWith('bound `startListener_` to "pause"');
        expect(overlay.player_.addEventListener).toHaveBeenCalledWith(overlay.startEvent_, expect.any(Function));
      });

      test('should remove event listener', () => {
        overlay.endEvent_ = 'play';
        overlay.hide();
        expect(overlay.debug).toHaveBeenCalledWith('unbound `endListener_` from "play"');
        expect(overlay.player_.removeEventListener).toHaveBeenCalledWith(overlay.endEvent_, overlay.endListenerBound_);
      });

      test('should call onHide', () => {
        overlay.options_.onHide = jest.fn();
        overlay.hide();
        expect(overlay.options_.onHide).toHaveBeenCalled();
      });

    });

    describe('shouldHide_', () => {

      test('should return true if number and time is greater than end', () => {
        overlay.options_.end = 30;
        expect(overlay.shouldHide_(40, 'time_update')).toBeTruthy();
      });

      test('should return false if number and time is less than end', () => {
        overlay.options_.end = 30;
        expect(overlay.shouldHide_(20, 'time_update')).toBeFalsy();
      });

      test('should return true if event and end event are equal', () => {
        overlay.options_.end = 'pause';
        expect(overlay.shouldHide_(40, 'pause')).toBeTruthy();
      });

      test('should return false if event and end event are equal', () => {
        overlay.options_.end = 'play';
        expect(overlay.shouldHide_(40, 'pause')).toBeFalsy();
      });

    });

    describe('show', () => {

      beforeEach(() => {
        jest.spyOn(overlay, 'debug').mockImplementation(() => {});
        overlay.el_ = {
          classList: {
            remove: jest.fn()
          }
        };
        overlay.startEvent_ = 'pause';
      });

      test('should remove class and event listener', () => {
        overlay.show();
        expect(overlay.el_.classList.remove).toHaveBeenCalledWith('chromecast-hidden');
        expect(overlay.player_.removeEventListener).toHaveBeenCalledWith(overlay.startEvent_, overlay.startListenerBound_);
        expect(overlay.debug).toHaveBeenCalledWith('shown');
        expect(overlay.debug).toHaveBeenCalledWith('unbound `startListener_` from "pause"');
      });

      test('should add event listener', () => {
        overlay.endEvent_ = 'play';
        overlay.show();
        expect(overlay.debug).toHaveBeenCalledWith('bound `endListener_` to "play"');
        expect(overlay.player_.addEventListener).toHaveBeenCalledWith(overlay.endEvent_, expect.any(Function));
      });

      test('should call onShow', () => {
        overlay.options_.onShow = jest.fn();
        overlay.show();
        expect(overlay.options_.onShow).toHaveBeenCalled();
      });

    });

    describe('shouldShow_', () => {

      test('should return true if event is same as start', () => {
        overlay.options_.start = 'play';
        expect(overlay.shouldShow_(40, 'play')).toBeTruthy();
      });

      test('should return false if event is different than start', () => {
        overlay.options_.start = 'play';
        expect(overlay.shouldShow_(40, 'pause')).toBeFalsy();
      });

      test('should return false if time is less than start', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 40;
        expect(overlay.shouldShow_(20, 'time_update')).toBeFalsy();
      });

      test('should return true if time is between start and end', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 40;
        expect(overlay.shouldShow_(35, 'time_update')).toBeTruthy();
      });

      test('should return false if time is greater than end', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 40;
        expect(overlay.shouldShow_(20, 'time_update')).toBeFalsy();
      });

      test('should return false if time is less than start with an end event', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 'pause';
        overlay.hasShownSinceSeek_ = false;
        expect(overlay.shouldShow_(20, 'time_update')).toBeFalsy();
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
      });

      test('should return true if time is greater than start with an end event', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 'pause';
        overlay.hasShownSinceSeek_ = false;
        expect(overlay.shouldShow_(50, 'time_update')).toBeTruthy();
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
      });

      test('should return true if it has shown since last seek and time is equal to start', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 'pause';
        overlay.hasShownSinceSeek_ = true;
        expect(overlay.shouldShow_(30, 'time_update')).toBeTruthy();
      });

      test('should return false if it has shown since last seek and time is not equal to start', () => {
        overlay.options_.start = 30;
        overlay.options_.end = 'pause';
        overlay.hasShownSinceSeek_ = true;
        expect(overlay.shouldShow_(40, 'time_update')).toBeFalsy();
      });
    });

    describe('startListener_', () => {

      beforeEach(() => {
        jest.spyOn(overlay, 'show').mockImplementation(() => {});
      });

      test('should call show()', () => {
        jest.spyOn(overlay, 'shouldShow_').mockImplementation(() => true);

        overlay.startListener_({
          type: 'play'
        });

        expect(overlay.shouldShow_).toHaveBeenCalledWith(50, 'play');
        expect(overlay.show).toHaveBeenCalled();
      });

      test('should not call show()', () => {
        jest.spyOn(overlay, 'shouldShow_').mockImplementation(() => false);

        overlay.startListener_({
          type: 'play'
        });

        expect(overlay.shouldShow_).toHaveBeenCalledWith(50, 'play');
        expect(overlay.show).not.toHaveBeenCalled();
      });
    });

    describe('endListener_', () => {

      beforeEach(() => {
        jest.spyOn(overlay, 'hide').mockImplementation(() => {});
      });

      test('should call hide()', () => {
        jest.spyOn(overlay, 'shouldHide_').mockImplementation(() => true);

        overlay.endListener_({
          type: 'play'
        });

        expect(overlay.shouldHide_).toHaveBeenCalledWith(50, 'play');
        expect(overlay.hide).toHaveBeenCalled();
      });

      test('should not call hide()', () => {
        jest.spyOn(overlay, 'shouldHide_').mockImplementation(() => false);

        overlay.endListener_({
          type: 'play'
        });

        expect(overlay.shouldHide_).toHaveBeenCalledWith(50, 'play');
        expect(overlay.hide).not.toHaveBeenCalled();
      });
    });

    describe('rewindListener_', () => {

      beforeEach(() => {
        jest.spyOn(overlay, 'hide').mockImplementation(() => {});
        jest.spyOn(overlay, 'debug').mockImplementation(() => {});
        overlay.hasShownSinceSeek_ = true;
      });

      test('should just set time when seeking forward', () => {
        overlay.previousTime_ = 30;

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
        expect(overlay.debug).not.toHaveBeenCalled();
        expect(overlay.hide).not.toHaveBeenCalled();
      });

      test('should hide if end is integer and overlay should not show at this time', () => {
        overlay.previousTime_ = 300;
        overlay.options_.start = 60;
        overlay.options_.end = 70;
        jest.spyOn(overlay, 'shouldShow_').mockImplementation(() => false);

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeFalsy();
        expect(overlay.debug).toHaveBeenCalledWith('rewind detected');
        expect(overlay.debug).toHaveBeenCalledWith('hiding; 70 is an integer and overlay should not show at this time');
        expect(overlay.hide).toHaveBeenCalled();
      });

      test('should do nothing if tme < previous, end is number and no conditions met', () => {
        overlay.previousTime_ = 300;
        overlay.options_.start = 40;
        overlay.options_.end = 60;
        jest.spyOn(overlay, 'shouldShow_').mockImplementation(() => true);

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
        expect(overlay.debug).toHaveBeenCalledWith('rewind detected');
        expect(overlay.hide).not.toHaveBeenCalled();
      });

      test('should hide if show point is before now and end point is an event', () => {
        overlay.previousTime_ = 300;
        overlay.options_.start = 60;
        overlay.options_.end = cast.framework.events.EventType.PAUSE;

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeFalsy();
        expect(overlay.debug).toHaveBeenCalledWith('rewind detected');
        expect(overlay.debug).toHaveBeenCalledWith('hiding; show point (60) is before now (50) and end point (pause) is an event');
        expect(overlay.hide).toHaveBeenCalled();
      });

      test('should do nothing if tme < previous, end is an event and no conditions met', () => {
        overlay.previousTime_ = 300;
        overlay.options_.start = 40;
        overlay.options_.end = cast.framework.events.EventType.PAUSE;

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
        expect(overlay.debug).toHaveBeenCalledWith('rewind detected');
        expect(overlay.hide).not.toHaveBeenCalled();
      });

    });

  });

});

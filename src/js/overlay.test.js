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
      options.start = cast.framework.events.EventType.TIME_UPDATE;
      overlay = new Overlay(player, options);
      expect(overlay['startEvent_']).toEqual(cast.framework.events.EventType.TIME_UPDATE);
    });

    test('should set player event', () => {
      options.start = cast.framework.events.EventType.PLAY;
      overlay = new Overlay(player, options);
      expect(overlay['startEvent_']).toEqual(cast.framework.events.EventType.PLAY);
    });

    test('should throw error if no start event', () => {
      //expect(new Overlay(player, options)).toThrow('invalid "start" option; expected number or string');
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
        getCurrentTimeSec: jest.fn().mockImplementation(() => 50)
      };
      const options = {
        start: 'play'
      };
      overlay = new Overlay(player, options);
    });

    describe('createEl', () => {

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

    });

    describe('shouldShow_', () => {

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
        overlay.options_.end = 'pause';

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
        overlay.options_.end = 'pause';

        overlay.rewindListener_();

        expect(overlay.previousTime_).toEqual(50);
        expect(overlay.hasShownSinceSeek_).toBeTruthy();
        expect(overlay.debug).toHaveBeenCalledWith('rewind detected');
        expect(overlay.hide).not.toHaveBeenCalled();
      });

    });

  });

});

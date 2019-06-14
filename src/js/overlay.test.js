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

  describe('function', () => {

    beforeEach(() => {
      const player = {
        addEventListener: jest.fn()
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

    });

    describe('endListener_', () => {

    });

    describe('rewindListener_', () => {

    });

  });

});

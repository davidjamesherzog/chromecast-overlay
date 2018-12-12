import {isNumber, hasNoWhitespace} from './utils';

class Overlay {

  constructor(player, options) {

    this.options_ = options;
    this.player_ = player;

    ['start', 'end'].forEach(key => {
      const value = this.options_[key];

      if (isNumber(value)) {
        this[key + 'Event_'] = cast.framework.events.EventType.TIME_UPDATE;
      } else if (hasNoWhitespace(value)) {
        this[key + 'Event_'] = value;

      // An overlay MUST have a start option. Otherwise, it's pointless.
      } else if (key === 'start') {
        throw new Error('invalid "start" option; expected number or string');
      }
    });

    // video.js does not like components with multiple instances binding
    // events to the player because it tracks them at the player level,
    // not at the level of the object doing the binding. This could also be
    // solved with Function.prototype.bind (but not videojs.bind because of
    // its GUID magic), but the anonymous function approach avoids any issues
    // caused by crappy libraries clobbering Function.prototype.bind.
    // - https://github.com/videojs/video.js/issues/3097

    /* ['endListener_', 'rewindListener_', 'startListener_'].forEach(name => {
      this[name] = (e) => Overlay.prototype[name].call(this, e);
    }); */

    // If the start event is a timeupdate, we need to watch for rewinds (i.e.,
    // when the user seeks backward).
    if (this.startEvent_ === cast.framework.events.EventType.TIME_UPDATE) {
      this.player_.addEventListener(cast.framework.events.EventType.TIME_UPDATE, this.rewindListener_.bind(this));
    }

    this.debug(`created, listening to "${this.startEvent_}" for "start" and "${this.endEvent_ || 'nothing'}" for "end"`);

    this.hide();

  }

  createEl() {
    const options = this.options_;
    const content = options.content;

    const background = options.showBackground ? 'chromecast-overlay-background' : 'chromecast-overlay-no-background';
    this.el_ = document.createElement('div');
    this.el_.className =  `chromecast-overlay chromecast-overlay-${options.align} ${options.class} ${background} chromecast-hidden`;

    if (options.id) {
      this.el_.appendChild(document.getElementById(options.id));
    } else if (typeof content === 'string') {
      this.el_.innerHTML = content;
    } else if (content instanceof window.DocumentFragment) {
      this.el_.appendChild(content);
    } else {
      document.appendContent(this.el_, content);
    }

    // Call callback function when overlay is created
    if (typeof this.options_.onReady === 'function') {
      this.options_.onReady();
    }

  }

  el() {
    return this.el_;
  }

  debug(...args) {

    if (!this.options_.debug) {
      return;
    }

    window.console.debug(...[`overlay#${this.id}: `, ...args]);

  }

  hide() {
    // need to hide here
    if (this.el_) {
      this.el_.classList.add('chromecast-hidden');
    }

    this.debug('hidden');
    this.debug(`bound \`startListener_\` to "${this.startEvent_}"`);

    // Overlays without an "end" are valid.
    if (this.endEvent_) {
      this.debug(`unbound \`endListener_\` from "${this.endEvent_}"`);
      this.player_.removeEventListener(this.endEvent_, this.endListener_);
    }

    // Call callback function when overlay is hidden
    if (typeof this.options_.onHide === 'function') {
      this.options_.onHide();
    }

    this.player_.addEventListener(this.startEvent_, this.startListener_.bind(this));

    return this;
  }

  shouldHide_(time, type) {
    const end = this.options_.end;

    return isNumber(end) ? (time >= end) : end === type;
  }

  show() {
    // should show
    this.el_.classList.remove('chromecast-hidden');

    this.player_.removeEventListener(this.startEvent_, this.startListener_);
    this.debug('shown');
    this.debug(`unbound \`startListener_\` from "${this.startEvent_}"`);

    // Overlays without an "end" are valid.
    if (this.endEvent_) {
      this.debug(`bound \`endListener_\` to "${this.endEvent_}"`);
      this.player_.addEventListener(this.endEvent_, this.endListener_.bind(this));
    }

    // Call callback function when overlay is shown
    if (typeof this.options_.onShow === 'function') {
      this.options_.onShow();
    }

    this.hidden = false;

    return this;

  }

  shouldShow_(time, type) {
    const start = this.options_.start;
    const end = this.options_.end;

    if (isNumber(start)) {

      if (isNumber(end)) {
        return time >= start && time < end;

      // In this case, the start is a number and the end is a string. We need
      // to check whether or not the overlay has shown since the last seek.
      } else if (!this.hasShownSinceSeek_) {
        this.hasShownSinceSeek_ = true;
        return time >= start;
      }

      // In this case, the start is a number and the end is a string, but
      // the overlay has shown since the last seek. This means that we need
      // to be sure we aren't re-showing it at a later time than it is
      // scheduled to appear.
      return Math.floor(time) === start;
    }

    return start === type;
  }

  startListener_(e) {
    // need to get chromecast time
    const time = this.player_.getCurrentTimeSec();

    if (this.shouldShow_(time, e.type)) {
      this.show();
    }
  }

  endListener_(e) {
    const time = this.player_.getCurrentTimeSec();

    if (this.shouldHide_(time, e.type)) {
      this.hide();
    }
  }

  rewindListener_() {
    const time = this.player_.getCurrentTimeSec();
    const previous = this.previousTime_;
    const start = this.options_.start;
    const end = this.options_.end;

    // Did we seek backward?
    if (time < previous) {
      this.debug('rewind detected');

      // The overlay remains visible if two conditions are met: the end value
      // MUST be an integer and the the current time indicates that the
      // overlay should NOT be visible.
      if (isNumber(end) && !this.shouldShow_(time)) {
        this.debug(`hiding; ${end} is an integer and overlay should not show at this time`);
        this.hasShownSinceSeek_ = false;
        this.hide();

      // If the end value is an event name, we cannot reliably decide if the
      // overlay should still be displayed based solely on time; so, we can
      // only queue it up for showing if the seek took us to a point before
      // the start time.
      } else if (hasNoWhitespace(end) && time < start) {
        this.debug(`hiding; show point (${start}) is before now (${time}) and end point (${end}) is an event`);
        this.hasShownSinceSeek_ = false;
        this.hide();
      }
    }

    this.previousTime_ = time;

  }

}

export default Overlay;

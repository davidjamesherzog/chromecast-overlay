# chromecast-overlay

A plugin to display simple overlays for Chromecast CAF - similar to YouTube's "Annotations" feature in appearance - during video playback.  This is based on the video.js overlay plugin developed by Brightcove - [videojs-overlay](https://github.com/brightcove/videojs-overlay)


Maintenance Status: Stable

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting Started](#getting-started)
- [Documentation](#documentation)
  - [Plugin Options](#plugin-options)
    - [`align`](#align)
    - [`showBackground`](#showbackground)
    - [`class`](#class)
    - [`content`](#content)
    - [`id`](#id)
    - [`debug`](#debug)
    - [`onReady`](#onready)
    - [`onHide`](#onhide)
    - [`onShow`](#onshow)
    - [`overlays`](#overlays)
  - [Examples](#examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="path/to/chromecast-overlay.js"></script>
<script>
  overlays({
    debug: true,
    overlays: [
      {
        id: 'pause-info',
        start: cast.framework.events.EventType.PAUSE,
        end: cast.framework.events.EventType.PLAY,
        align: 'top-left'
      }
    ]
  });
</script>
...
<div id="pause-info">
  Paused
</div>
```

## Documentation

### Plugin Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### `align`

__Type:__ `String`
__Default:__ `"top-left"`

_This setting can be overridden by being set on individual overlay objects._

Where to display overlays, by default. Assuming the included stylesheet is used, the following values are supported: `"top-left"`, `"top"`, `"top-right"`, `"right"`, `"bottom-right"`, `"bottom"`, `"bottom-left"`, `"left"`, `"all"`.

#### `showBackground`

__Type:__ `Boolean`
__Default:__ `true`

_This setting can be overridden by being set on individual overlay objects._

Whether or not to include background styling & padding around the overlay.

#### `class`

__Type:__ `String`
__Default:__ `""`

_This setting can be overridden by being set on individual overlay objects._

A custom HTML class to add to each overlay element.

#### `content`

__Type:__ `String`, `Element`, `DocumentFragment`
__Default:__ `"This overlay will show up while the video is playing"`

_This setting can be overridden by being set on individual overlay objects._

The default HTML that the overlay includes.

#### `id`

__Type:__ `String`
__Default:__ `""`

_This setting can be overridden by being set on individual overlay objects._

The id of HTML element that the overlay includes.

#### `debug`

__Type:__ `Boolean`
__Default:__ `false`

_This setting can be set when initializing the overlay objects._

Turns on debugging in the console.

#### `onReady`

__Type:__ `Function`
__Default:__ `undefined`

_This setting can be overridden by being set on individual overlay objects._

A callback function to be called when the overlay is ready.

#### `onHide`

__Type:__ `Function`
__Default:__ `undefined`

_This setting can be overridden by being set on individual overlay objects._

A callback function to be called when the overlay is hidden.

#### `onShow`

__Type:__ `Function`
__Default:__ `undefined`

_This setting can be overridden by being set on individual overlay objects._

A callback function to be called when the overlay is shown.

#### `overlays`

__Type:__ `Array`
__Default:__ an array with a single example overlay

An array of overlay objects. An overlay object should consist of:

- `start` (`String` or `Number`): When to show the overlay. If its value is a string, it is understood as the name of an event. If it is a number, the overlay will be shown when that moment in the playback timeline is passed.
- `end` (`String` or `Number`): When to hide the overlay. The values of this property have the same semantics as `start`.

And it can optionally include `align`, `class`, and/or `content` to override top-level settings.

All properties are currently optional. That is, you may leave `start` or `end` off and the plugin will not complain, but you should always pass a `start` and an `end`. This will be required in a future release.

### Examples

You can setup overlays to be displayed when particular events are emitted by the player, including your own custom events:

```js
overlays({
  debug: true,
  overlays: [{

    // This overlay will appear when a video is playing and disappear when
    // the player is paused.
    id: 'play-info',
    start: cast.framework.events.EventType.PLAY,
    end: cast.framework.events.EventType.PAUSE,
    align: 'top-left'
  }, {
    // This overlay will appear when a video is pasued and disappear when
    // the player is playing again.
    id: 'pause-info',
    start: cast.framework.events.EventType.PAUSE,
    end: cast.framework.events.EventType.PLAY,
    align: 'top-left'
  }]
});
```

Multiple overlays can be displayed simultaneously. You probably want to specify an alignment for one or more of them so they don't overlap:

```js
overlays({
  debug: true,
  overlays: [{
    // This overlay appears at 3 seconds and disappears at 15 seconds.
    id: 'first-interval',
    start: 3,
    end: 15,
    align: 'top'
  }, {
    // This overlay appears at 7 seconds and disappears at 22 seconds.
    id: 'second-interval',
    start: 7,
    end: 22,
    align: 'bottom'
  }]
});
```

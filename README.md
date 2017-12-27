# Zoom Gesture

[![npm](https://img.shields.io/npm/v/zoom-gesture.svg)](https://www.npmjs.com/package/zoom-gesture)

npm library that detects zoom gesture (mouse wheel or pinch) on DOM node

## Example

```js
import ZoomGesture from 'zoom-gesture';

const zoomNode = document.querySelector('.zoom');
const zoomHandler = new ZoomGesture({
  element: zoomNode,
  minScale: 1,
  maxScale: 2,
  // read more about options below
});
const fn = zoom => { /* some things with zoom */ };

zoomHandler.on('change', fn);
zoomHandler.init();
// read more about methods below
```

## Options

### element

DOM node where you need to detect zoom gesture.

Default: `window`.

### initScale

Init value of scale.

Default: `1`.

### wheelScaleSize

Amount of pixels that user must scroll by mouse or touchpad
to change `scale` value by 1.

Default: `300`.

### touchScaleSize

Amount of pixels that user must move (pinch) by touch pointers 
(fingers, etc) using to change `scale` value by 1.

Default: `undefined`.

**Note**: there is no default value,
because default behaviour is slightly different.

By default when user starts to do pinch gesture, 
the library counts distance between touch points
and when it doubles — the library increases `scale` value by 1 
(when it is tripled — by 2, etc).   

### minScale

Minimum value of `scale`.

Default: `undefined`.

**Note**: `undefined` value (or any other non-numeric) value means
that `scale` value may be negative.

### maxScale

Maximum value of `scale`.

Default: `undefined`.

## Methods

### init

Use it to initialize all listeners.

### destroy

Use it to remove all listeners.

### setScale

Use it to set `scale` value manually, it you need it.

**Note**: the library does not check value that you set
using this method by range of possible values
(that you can set by `minScale` and `maxScale`), 
but it triggers listeners of `change` event.

*Arguments*:
- `scale` (numeric).

### on

Use it to add listeners for the library events.

Right now there is only one event — `change`.
Read about it below.

*Arguments*:
- `event` (string);
- `fn` (func).

### off

Use it to remove listeners for the library events.

Right now there is only one event — `change`.
Read about it below.

*Arguments*:
- `event` (string);
- `fn` (func).

## Events

### change

Handlers for this event are called
when `scale` value is changed by user's zoom gesture.

*Parameters passed to handler*:
- `scale` (numeric).

## Why?

Sometimes I need to implement some things where I need to
detect zoom gesture and do something depends on it.
For example, image editor where you can change zoom of
selected image.

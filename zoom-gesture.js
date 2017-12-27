'use strict';

module.exports = ZoomGesture;
export default ZoomGesture;

class ZoomGesture {
  constructor({
    element = window,
    initScale = 1,
    wheelScaleSize = 300,
    touchScaleSize,
    minScale = null,
    maxScale = null,
  } = {}) {
    this.element = element;

    this.handlers = {
      wheel: this.onWheel.bind(this),
      touchstart: this.onTouchStart.bind(this),
      touchend: this.onTouchEnd.bind(this),
      touchmove: this.onTouchMove.bind(this),
      touchcancel: this.onTouchEnd.bind(this),
    };

    this.scale = initScale;
    this.wheelScaleSize = wheelScaleSize;
    this.touchScaleSize = touchScaleSize;
    this.minScale = minScale;
    this.maxScale = maxScale;

    this.touchIds = [];
    this.touchStartDistance = 0;

    this.listeners = { change: [] };
  }

  onWheel(e) {
    e.preventDefault();
    this.updateScale(this.scale + -e.deltaY / this.wheelScaleSize);
  }

  onTouchStart(e) {
    if (e.touches.length !== 2) {
      this.touchIds = [];
      return;
    }

    this.touchIds = Array.from(e.touches).map(x => x.identifier);
    this.touchStartDistance = this.getDistanceBetweenTouches(e.touches);
    this.touchStartScale = this.scale;
  }

  onTouchEnd(e) {
    if (this.touchIds.length !== 2) return;

    const idsToRemove = Array.from(e.changedTouches).map(x => x.identifier);

    if (idsToRemove.length > 0) {
      this.touchIds = [];
    }
  }

  onTouchMove(e) {
    if (this.touchIds.length > 0) {
      e.preventDefault();

      const currentDistance = this.getDistanceBetweenTouches(e.touches);
      const distanceScale = (currentDistance - this.touchStartDistance) / this.touchStartDistance;
      let resultScale = this.touchStartScale + distanceScale;

      if (this.touchScaleSize) {
        resultScale = this.touchStartScale + (currentDistance - this.touchStartDistance) / this.touchScaleSize;
      }

      this.updateScale(resultScale);
    }
  }

  getDistanceBetweenTouches(touches) {
    touches = Array.from(touches);
    const { screenX: x1, screenY: y1 } = touches.find(x => x.identifier === this.touchIds[0]);
    const { screenX: x2, screenY: y2 } = touches.find(x => x.identifier === this.touchIds[1]);

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  updateScale(scale) {
    this.scale = scale;

    if (typeof this.minScale === 'number' && this.scale < this.minScale) {
      this.scale = this.minScale;
    } else if (typeof this.maxScale === 'number' && this.scale > this.maxScale) {
      this.scale = this.maxScale;
    }

    this.listeners.change.forEach(fn => fn(this.scale));
  }

  init() {
    Object.keys(this.handlers).forEach(key => this.element.addEventListener(key, this.handlers[key]));
  }

  destroy() {
    Object.keys(this.handlers).forEach(key => this.element.removeEventListener(key, this.handlers[key]));
  }

  setScale(scale) {
    this.scale = scale;

    this.listeners.change.forEach(fn => fn(this.scale));
  }

  on(event, callback) {
    if (!this.listeners.hasOwnProperty(event)) return;

    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners.hasOwnProperty(event)) return;

    this.listeners[event] = this.listeners[event].filter(x => x !== callback);
  }
}

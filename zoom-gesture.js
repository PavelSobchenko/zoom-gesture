'use strict';
const DOUBLE_TAP_TIME = 300;

class ZoomGesture {
  constructor({
    element = window,
    initScale = 1,
    wheelScaleSize = 300,
    touchScaleSize,
    minScale = null,
    maxScale = null,
    useDoubleTap = false,
    useMouse = true
  } = {}) {
    this.element = element;

    this.handlers = {
      touchstart: this.onTouchStart.bind(this),
      touchend: this.onTouchEnd.bind(this),
      touchmove: this.onTouchMove.bind(this),
      touchcancel: this.onTouchEnd.bind(this),
    };
    if (useMouse) {
      this.handlers.wheel = this.onWheel.bind(this);
    }

    this.scale = initScale;
    this.wheelScaleSize = wheelScaleSize;
    this.touchScaleSize = touchScaleSize;
    this.minScale = minScale;
    this.maxScale = maxScale;

    this.useDoubleTap = useDoubleTap;
    this.lastTouchTime = null;

    this.touchIds = [];
    this.touchStartDistance = 0;
    this.center = {x: 0, y: 0};

    this.listeners = { change: [] };
  }

  static cancelEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  getVectorCenter(vectors) {
    const container = this.element.parentNode || this.element;
    const rect = container.getBoundingClientRect();

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

    const posTop = rect.top + scrollTop;
    const posLeft = rect.left + scrollLeft;

    vectors.forEach(vector => {
        vector.x = (vector.x - posLeft) / this.scale;
        vector.y = (vector.y - posTop) / this.scale;
    });

    const x = vectors.map(v => v.x).reduce((sum, curr) => sum + curr) / vectors.length;
    const y = vectors.map(v => v.y).reduce((sum, curr) => sum + curr) / vectors.length;

    return {
      x: vectors.map(v => v.x).reduce((sum, curr) => sum + curr) / vectors.length,
      y: vectors.map(v => v.y).reduce((sum, curr) => sum + curr) / vectors.length
    };
  }

  onWheel(e) {
    ZoomGesture.cancelEvent(e);
    this.center = this.getVectorCenter([{x: e.pageX, y: e.pageY}]);
    this.updateScale(this.scale + -e.deltaY / this.wheelScaleSize);
  }

  onTouchStart(e) {
    const vectors = Array.from(e.touches).map(touch => {
      return {
        x: touch.pageX,
        y: touch.pageY
      }
    });
    this.center = this.getVectorCenter(vectors);

    if (e.touches.length !== 2) {
      if (this.useDoubleTap) {
        const time = Date.now();

        if (time - this.lastTouchTime <= DOUBLE_TAP_TIME) {
          ZoomGesture.cancelEvent(e);
          this.setScale(this.scale !== this.minScale ? this.minScale : this.maxScale);
        }

        this.lastTouchTime = time;
      } else {
        this.touchIds = [];
      }
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
      ZoomGesture.cancelEvent(e);

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
    const diff = scale - this.scale;
    const offsetX = (this.center.x * diff) / this.scale;
    const offsetY = (this.center.y * diff) / this.scale;
    this.scale = scale;

    if (typeof this.minScale === 'number' && this.scale < this.minScale) {
      this.scale = this.minScale;
    } else if (typeof this.maxScale === 'number' && this.scale > this.maxScale) {
      this.scale = this.maxScale;
    }

    this.listeners.change.forEach(fn => fn({
      scale: this.scale,
      offsetX: offsetX,
      offsetY: offsetY
    }));
  }

  init() {
    Object.keys(this.handlers).forEach(key => this.element.addEventListener(key, this.handlers[key]));
  }

  destroy() {
    Object.keys(this.handlers).forEach(key => this.element.removeEventListener(key, this.handlers[key]));
  }

  setScale(scale) {
    this.updateScale(scale);
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

module.exports = ZoomGesture;
export default ZoomGesture;

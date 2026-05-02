import '@testing-library/jest-dom';

// TextEncoder Polyfill for Node environment running jsdom
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = require('util').TextDecoder;
}

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver as any;

if (typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.getAnimations === 'undefined') {
  HTMLElement.prototype.getAnimations = function() { return []; };
}

if (typeof Element !== 'undefined') {
  if (typeof Element.prototype.scrollTo === 'undefined') {
    Element.prototype.scrollTo = function() {};
  }
  if (typeof Element.prototype.scrollBy === 'undefined') {
    Element.prototype.scrollBy = function() {};
  }
}

import '@testing-library/jest-dom';

// TextEncoder Polyfill for Node environment running jsdom
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = require('util').TextDecoder;
}

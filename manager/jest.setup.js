import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof Request === 'undefined') {
  global.Request = require('node-fetch').Request;
  global.Response = require('node-fetch').Response;
  global.Headers = require('node-fetch').Headers;
  global.fetch = require('node-fetch');
}

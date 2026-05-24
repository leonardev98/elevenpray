'use strict';

/**
 * Vercel entrypoint (committed file — must exist before build).
 * `npm run build` produces dist/main.js; this file loads it at runtime.
 */
require('reflect-metadata');
require('./dist/main');

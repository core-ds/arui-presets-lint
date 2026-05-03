import { getTestRule } from 'jest-preset-stylelint';
import os from 'node:os';
import { afterAll, beforeAll } from 'vitest';

import plugins from './lib/index.js';

declare global {
    // eslint-disable-next-line vars-on-top -- глобальная декларация для testRule в tests
    var testRule: ReturnType<typeof getTestRule>;
}

// Передаём плагины как объекты, а не строкой './' — stylelint иначе
// пытается резолвить плагин через Node, который не умеет .ts напрямую.
globalThis.testRule = getTestRule({ plugins });

const eolDescriptor = Object.getOwnPropertyDescriptor(os, 'EOL');
if (!eolDescriptor) {
    throw new TypeError('`os` must have an `EOL` property');
}

beforeAll(() => {
    Object.defineProperty(os, 'EOL', { ...eolDescriptor, value: '\n' });
});

afterAll(() => {
    Object.defineProperty(os, 'EOL', eolDescriptor);
});

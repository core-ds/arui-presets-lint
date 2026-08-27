#!/usr/bin/env node

import { run } from './commands.mjs';

await run(process.argv.slice(2));

#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require('../src/mdexpr').cli(process.argv);

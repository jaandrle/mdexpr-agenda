#!/usr/bin/env node

const requireESM = require('esm')(module /*, options*/);
const { fromCLI }= requireESM('../src/mdexpr');

const data= fromCLI(process.argv);
console.log(data);

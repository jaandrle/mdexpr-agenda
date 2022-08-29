#!/usr/bin/env node
/* global require:true */
require = require('esm')(module /*, options*/);
const { mdexpr }= require('../src/mdexpr');

mdexpr({
	oncli: console.log
});

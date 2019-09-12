'use strict';
const dgram = require("dgram");
const config = require('./node3.config.js');
console.log(':: config=<',config,'>');
const PPMQ = require('../ppmq.js');
const ppmq = new PPMQ(config);

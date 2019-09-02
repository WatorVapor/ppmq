'use strict';
const dgram = require("dgram");
const config = require('./node3.config.js');
console.log(':: config=<',config,'>');
const Node = require('./node.js');
const node1 = new Node(config);
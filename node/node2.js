'use strict';
const dgram = require("dgram");
const config = require('./node2.config.js');
console.log(':: config=<',config,'>');
const Node = require('./node.js');
const node1 = new Node(config);
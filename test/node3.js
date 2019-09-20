'use strict';
const dgram = require("dgram");
const config = require('./node3.config.js');
console.log(':: config=<',config,'>');
const PPMQ = require('../ppmq.js');
const ppmq = new PPMQ(config);
const topic = 'hello';

ppmq.subscribe(topic);

const onMsg = (topic,msg) => {
  console.log('onMsg topic=<',topic,'>');
  console.log('onMsg msg=<',msg,'>');
};
ppmq.on('message',(topic,msg)=> {
  onMsg(topic,msg);
});

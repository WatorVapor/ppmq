'use strict';
const dgram = require("dgram");
const config = require('./node1.config.js');
console.log(':: config=<',config,'>');
const PPMQ = require('../ppmq.js');
const ppmq = new PPMQ(config);
const topic = 'hello';
ppmq.subscribe(topic);

const onMsg = (topic,msg) => {
  console.log('onMsg topic=<',topic,'>');
  console.log('onMsg msg=<',msg,'>');
};


ppmq.once('ready',(evt)=> {
  console.log('once ready evt=<',evt,'>');
  ppmq.publish(topic,'good morning!!',true);
});

ppmq.on('message',(topic,msg)=> {
  onMsg(topic,msg);
});

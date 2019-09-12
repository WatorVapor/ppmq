'use strict';
const dgram = require("dgram");
const config = require('./node2.config.js');
console.log(':: config=<',config,'>');
const PPMQ = require('../ppmq.js');
const ppmq = new PPMQ(config);
const topic = 'hello';

ppmq.once('ready',(evt)=> {
  console.log('once ready evt=<',evt,'>');
  setTimeout(()=>{
    ppmq.publish(topic,'good morning!!');
  },2000);
});

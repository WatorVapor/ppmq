'use strict';
const EventEmitter = require('events');
const Node = require('./node.js');

class PPMQ extends EventEmitter {
  constructor(config) {
    super();
    this.node_ = new Node(config);
    this.node_.onReady = this.onReady_.bind(this);
  }
  subscribe(topic,handler) {
    this.node_.subscribe(topic,handler);
  }
  publish(topic,msg,toMe) {
    this.node_.publish(topic,msg,toMe);
  }
  onReady_(){
    //console.log('PPMQ this.emit=<',this.emit,'>');
    this.emit('ready');
  }
}

module.exports = PPMQ;



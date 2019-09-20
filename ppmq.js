'use strict';
const EventEmitter = require('events');
const Node = require('./node.js');

class PPMQ extends EventEmitter {
  constructor(config) {
    super();
    this.node_ = new Node(config);
    this.node_.onReady = this.onReady_.bind(this);
  }
  subscribe(topic) {
    this.node_.subscribe(topic,this.onMessage_.bind(this));
  }
  publish(topic,msg,toMe) {
    this.node_.publish(topic,msg,toMe);
  }
  onReady_(){
    //console.log('PPMQ this.emit=<',this.emit,'>');
    this.emit('ready');
  }
  onMessage_(topic,message) {
    console.log('PPMQ onMessage_:topic=<',topic,'>');
    console.log('PPMQ onMessage_:message=<',message,'>');
    this.emit('message',topic,message);
  }
}

module.exports = PPMQ;

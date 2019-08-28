'use strict';
//const ip = require('ip');
const os = require('os');
const dgram = require("dgram");
const NodeSecurity = require('./node.security.js');

class Node {
  constructor(config) {
    this.serverCtrl = dgram.createSocket("udp6");
    this.serverData = dgram.createSocket("udp6");
    this.config = config;
    this.worldCtrl = {};
    this.security = new NodeSecurity(config);
    this.peers = {};
    this.peers[this.security.idB58] = {host:'::1',ports:config.listen};
    
    let self = this;
    this.serverCtrl.on("listening", ()=>{
      onListenCtrlServer(self.serverCtrl);
    });
    this.serverCtrl.on("message", (msg, rinfo)=> {
      self.onMessageCtrlServer__(msg, rinfo)
    });
    this.serverCtrl.bind(config.listen.ctrl);

    this.serverData.on("listening", () => {
      onListenDataServer(self.serverData);
    });
    this.serverData.on("message", (msg, rinfo) => {
      self.onMessageDataServer__(msg, rinfo)
    });
    this.serverData.bind(config.listen.data);
    this.readMachienIp__();
    

    setTimeout(()=>{
      self.doClientEntry__(config.entrance,config.listen);
    },1000);

    setInterval(()=>{
      self.doClientPingPong__();
    },2000);
    
    
  }

  onMessageCtrlServer__(msg, rinfo){
    //console.log('onMessageCtrlServer__ msg=<',msg.toString('utf-8'),'>');
    //console.log('onMessageCtrlServer__ rinfo=<',rinfo,'>');
    try {
      const msgJson = JSON.parse(msg.toString('utf-8'));
      console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
      //console.log('onMessageCtrlServer__ this.config=<',this.config,'>');
      const good = this.security.verify(msgJson);
      //console.log('onMessageCtrlServer__ good=<',good,'>');
      if(!good) {
        console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
        return ;
      }
      const rPeerId = this.security.calcID(msgJson);
      if(msgJson.ctrl.entry) {
        const addressIndex = this.ip__.indexOf(rinfo.address);
        console.log('onMessageCtrlServer__ addressIndex=<',addressIndex,'>');
        if(addressIndex === -1) {
          this.onNewNodeEntry__(rPeerId,rinfo.address,msgJson.listen);
        } else {
          if(msgJson.listen.ctrl !== this.config.listen.ctrl) {
            this.onNewNodeEntry__(rPeerId,rinfo.address,msgJson.listen);
          }
        }
      }
    }catch (e){
      console.log('onMessageCtrlServer__ e=<',e,'>');
      console.log('onMessageCtrlServer__ msg.toString("utf-8")=<',msg.toString('utf-8'),'>');
    }
  };
  
  onMessageDataServer__(msg, rinfo){
    console.log('onMessageDataServer__ msg=<',msg.toString('utf-8'),'>');
    console.log('onMessageDataServer__ rinfo=<',rinfo,'>');
  };


  onNewNodeEntry__(id,rAddress,ports) {
    console.log('onNewNodeEntry__ id=<',id,'>');
    console.log('onNewNodeEntry__ rAddress=<',rAddress,'>');
    console.log('onNewNodeEntry__ ports=<',ports,'>');
    console.log('onNewNodeEntry__ this.peers=<',this.peers,'>');
    this.peers[id] = {host:rAddress,ports:ports};
  }
  
  readMachienIp__() {
    this.ip__ = [];
    const interfaces = os.networkInterfaces();
    //console.log('readMachienIp__ interfaces=<',interfaces,'>');
    for(const [dev, infos] of Object.entries(interfaces)) {
      //console.log('onListenDataServer dev=<',dev,'>');
      //console.log('onListenDataServer infos=<',infos,'>');
      for(const info of infos) {
        if(info.family === 'IPv6') {
          this.ip__.push(info.address);
        }
      }
    }
  }
  
  doClientEntry__ (entrance,listen) {
    console.log('doClientEntry__ entrance=<',entrance,'>');
    const client = dgram.createSocket("udp6");
    for(let address of entrance) {
      console.log('doClientEntry__ address=<',address,'>');
      let msg = {ctrl:{entry:true},listen:listen};
      let msgSign = this.security.sign(msg);
      const bufMsg = Buffer.from(JSON.stringify(msgSign));
      client.send(bufMsg, address.port,address.host,(err) => {
        //console.log('doClientEntry__ err=<',err,'>');
      });
    }
  };

  doClientPingPong__ () {
    console.log('doClientPingPong__ this.peers=<',this.peers,'>');
  };

  
}

module.exports = Node;


const onListenCtrlServer = (server,evt) => {
  const address = server.address();
  console.log('onListenCtrlServer address=<',address,'>');
};
const onListenDataServer = (server,evt) => {
  const address = server.address();
  console.log('onListenDataServer address=<',address,'>');
};


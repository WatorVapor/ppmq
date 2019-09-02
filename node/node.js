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
    this.client = dgram.createSocket("udp6");
    
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
      self.doClientPing__();
    },2000);
    
    
  }

  onMessageCtrlServer__(msg, rinfo){
    //console.log('onMessageCtrlServer__ msg=<',msg.toString('utf-8'),'>');
    //console.log('onMessageCtrlServer__ rinfo=<',rinfo,'>');
    try {
      const msgJson = JSON.parse(msg.toString('utf-8'));
      //console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
      //console.log('onMessageCtrlServer__ this.config=<',this.config,'>');
      const good = this.security.verify(msgJson);
      //console.log('onMessageCtrlServer__ good=<',good,'>');
      if(!good) {
        console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
        return ;
      }
      const rPeerId = this.security.calcID(msgJson);
      if(msgJson.ctrl) {
        if(msgJson.ctrl.entry) {
          const addressIndex = this.ip__.indexOf(rinfo.address);
          //console.log('onMessageCtrlServer__ addressIndex=<',addressIndex,'>');
          if(addressIndex === -1) {
            this.onNewNodeEntry__(rPeerId,rinfo.address,msgJson.listen);
          } else {
            if(msgJson.listen.ctrl !== this.config.listen.ctrl) {
              this.onNewNodeEntry__(rPeerId,rinfo.address,msgJson.listen);
            }
          }
        } else if(msgJson.ctrl.entrance) {
          //console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
          this.onEntranceNode__(msgJson.ctrl.entrance);
        } else if(msgJson.ctrl.ping) {
          //console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
          const sentTp = new Date(msgJson.sign.ts);
          sentTp.setMilliseconds(msgJson.sign.ms);
          //console.log('onMessageCtrlServer__ sentTp=<',sentTp,'>');
          const recieveTp = new Date();
          const tta = recieveTp-sentTp;
          //console.log('onMessageCtrlServer__ tta=<',tta,'>');
          this.onPeerPing__(rPeerId,sentTp,tta);
        } else if(msgJson.ctrl.pong) {
          //console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
          this.onPeerPong__(rPeerId,msgJson.ctrl.pong);
        } else {
          console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
        }
      } else {
        console.log('onMessageCtrlServer__ msgJson=<',msgJson,'>');
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
    //console.log('onNewNodeEntry__ id=<',id,'>');
    //console.log('onNewNodeEntry__ rAddress=<',rAddress,'>');
    //console.log('onNewNodeEntry__ ports=<',ports,'>');
    //console.log('onNewNodeEntry__ this.peers=<',this.peers,'>');
    this.peers[id] = {host:rAddress,ports:ports};
    console.log('onNewNodeEntry__ this.peers=<',this.peers,'>');

    let msg = {ctrl:{entrance:this.peers}};
    let msgSign = this.security.sign(msg);
    const bufMsg = Buffer.from(JSON.stringify(msgSign));
    this.client.send(bufMsg, ports.ctrl,rAddress,(err) => {
      //console.log('doClientEntry__ err=<',err,'>');
    });
  }
  onEntranceNode__(entrance) {
    console.log('onEntranceNode__ entrance=<',entrance,'>');
    this.peers = Object.assign(this.peers, entrance);
    console.log('onPeerPing___ this.peers=<',this.peers,'>');
  }
  
  
  
  onPeerPing__(id,pingTp,tta) {
    //console.log('onPeerPing__ id=<',id,'>');
    //console.log('onPeerPing__ tta=<',tta,'>');
    if(this.peers[id]) {
      //console.log('onPeerPing__ this.peers[id]=<',this.peers[id],'>');
      this.peers[id].tta = tta;
      
      const peerInfo = this.peers[id];
      const now = new Date();
      let msg = {
        ctrl:{
          pong:{
            ping:{
              ts:pingTp.toGMTString(),
              ms:pingTp.getMilliseconds()
            },
            pong:{
              ts:now.toGMTString(),
              ms:now.getMilliseconds()
            }
          }
        }
      };
      let msgSign = this.security.sign(msg);
      const bufMsg = Buffer.from(JSON.stringify(msgSign));
      this.client.send(bufMsg, peerInfo.ports.ctrl,peerInfo.host,(err) => {
        //console.log('onPeerPing__ err=<',err,'>');
      });
    }
    //console.log('onPeerPing___ this.peers=<',this.peers,'>');    
  }
  onPeerPong__(id,pong) {
    //console.log('onPeerPong__ id=<',id,'>');
    //console.log('onPeerPong__ pong=<',pong,'>');
    const now = new Date();
    const pingTp = new Date(pong.ping.ts);
    pingTp.setMilliseconds(pong.ping.ms);
    //console.log('onPeerPong__ pingTp=<',pingTp,'>');
    const ttr = now - pingTp;
    //console.log('onPeerPong__ ttr=<',ttr,'>');
    if(this.peers[id]) {
      //console.log('onPeerPing__ this.peers[id]=<',this.peers[id],'>');
      this.peers[id].ttr = ttr;
    }
    console.log('onPeerPong__ this.peers=<',this.peers,'>');
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
    for(let address of entrance) {
      console.log('doClientEntry__ address=<',address,'>');
      let msg = {ctrl:{entry:true},listen:listen};
      let msgSign = this.security.sign(msg);
      const bufMsg = Buffer.from(JSON.stringify(msgSign));
      this.client.send(bufMsg, address.port,address.host,(err) => {
        //console.log('doClientEntry__ err=<',err,'>');
      });
    }
  };

  doClientPing__ () {
    //console.log('doClientPing__ this.peers=<',this.peers,'>');
    this.eachRemotePeer__((peer,peerInfo)=> {
      //console.log('doClientPing__ peer=<',peer,'>');
      //console.log('doClientPing__ peerInfo=<',peerInfo,'>');
      let msg = {ctrl:{ping:true}};
      let msgSign = this.security.sign(msg);
      const bufMsg = Buffer.from(JSON.stringify(msgSign));
      this.client.send(bufMsg, peerInfo.ports.ctrl,peerInfo.host,(err) => {
        //console.log('doClientPing__ err=<',err,'>');
      });
    });
  };
  
  eachRemotePeer__(fn) {
    for(let peer in this.peers) {
      //console.log('eachRemotePeer__ peer=<',peer,'>');
      let peerInfo = this.peers[peer];
      //console.log('eachRemotePeer__ peerInfo=<',peerInfo,'>');
      if(peer !== this.security.idB58) {
        fn(peer,peerInfo);
      }
    }    
  }

  
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


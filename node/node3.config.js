const config = {
  listen:{
    ctrl:8897,
    data:8898
  },
  entrance:[
    {
      host:'::1',
      port:8890
    },
    {
      host:'::1',
      port:8895
    },
    {
      host:'::1',
      port:8897
    },
  ],
  reps: {
    path:'./node_data_3'
  }
};
module.exports = config;

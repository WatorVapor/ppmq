const config = {
  listen:{
    ctrl:8890,
    data:8891
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
  ],
  reps: {
    path:'./node_data_1'
  }
};
module.exports = config;

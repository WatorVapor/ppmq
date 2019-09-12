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
    {
      host:'::1',
      port:8897
    },
  ],
  reps: {
    path:__dirname + '/node_data_1'
  }
};
module.exports = config;

const config = {
  listen:{
    ctrl:8895,
    data:8896
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
    path:__dirname + '/node_data_2'
  }
};
module.exports = config;

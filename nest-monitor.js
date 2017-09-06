'use strict';

//Dependencies
const common = require('./server/common');
const nest = require('./server/nest');

const configPath = './server/config.json';
var interval = 5 * 60 * 1000; //In ms, default to 5 minutes

const iteration = () => {
  common.getConfig(configPath).then((config) => {
    interval = config.nestCheckFrequency * 60 * 1000;
    nest.requestNestDataAndSetFan(config);
  }).catch((err) => {
    log.error('Error caught in iteration. ', err);
  });
};

//Run once manually and kick off the nest iterations. 
iteration();
setInterval(() => { iteration();}, interval);

'use strict';

const Promise = require('bluebird');
const nest = Promise.promisifyAll(require('unofficial-nest-api'));
const common = require('./common');

module.exports.requestNestDataAndSetFan = (config) => {
  return new Promise((resolve, reject) => {
    login(config).then((data) => {
      //can't use promisify for this function; 
      //it doesn't satisify the contract required by bluebird
      nest.fetchStatus((data) => {
        calculateAndSetFanStatus(config, data);
        resolve();
      });
    });
  });
};

const login = (config) => {
  return nest.loginAsync(config.username, config.password);
};

const calculateAndSetFanStatus = (config, data) => {
  common.getSensorTemperature(config.sensorFile).then((sensorTemp) => {
    for (var deviceId in data.device) {
      if (data.device.hasOwnProperty(deviceId)) {
        var device = data.shared[deviceId];
        common.calculateFanStatus(config, device, sensorTemp) ? nest.setFanModeOn() :
          nest.setFanModeAuto();
        return;
      }
    }
  });


};


'use strict';


const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const util = require('util');
var logger = require('logger').createLogger();

module.exports.getSensorTemperature = (sensorFile) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(sensorFile).then((data) => {
      var dataArray = data.toString('ascii').split(' '); // Split by space
      var temp = parseFloat(dataArray[dataArray.length - 1].split('=')[1]) / 1000.0;
      resolve(temp);
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports.getConfig = (configPath) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(configPath).then((data) => {
      resolve(JSON.parse(data));
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports.calculateFanStatus = (config, device, sensor) => {

  var targetTemp = device.target_temperature;
  var currentTemp = device.current_temperature;
  var sensorTemp = sensor;

  logger.info(util.format('currentTemp: %s targetTemp: %s sensorTemp :%s fanState: %s currentVsTargetTol: %s sensorVsNestTol: %s ',
    currentTemp, targetTemp, sensorTemp, device.hvac_fan_state, config.currentVsTargetTolerance, config.sensorVsNestTolerance));

  if (device.auto_away === 1) {
    logger.info('Auto away active ignoring temperatures.');
    return false;
  }

  if (Math.abs(targetTemp - currentTemp) > config.currentVsTargetTolerance) {
    logger.info('The current temperature and target temperature are too far apart. Ne will automatically run the fan soon. Ignoring sensor temperature.');
    return false;
  }

  //We test against the target temperature not the current temperature because current temperature will have less predictable shifts. 
  if (Math.abs(targetTemp - (sensorTemp + config.sensorAdjustment)) > config.sensorVsNestTolerance) {
    logger.info('The target temperature and sensor temperature are too far apart. We should run the fan.');
    return true;
  }

  logger.info('The target temperature and sensor temperature are too close. We should switch the fan to auto.');
  return false;

};

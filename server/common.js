'use strict';


const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const util = require('util');

module.exports.getSensorTemperature = (sensorFile) => {
  return fs.readFileAsync(sensorFile).then((data) => {
    var dataArray = data.toString('ascii').split(' '); // Split by space
    const temp = parseFloat(dataArray[dataArray.length - 1].split('=')[1]) / 1000.0;
    return temp;
  });
};

module.exports.getConfig = (configPath) => {
  return fs.readFileAsync(configPath).then((data) => {
    return JSON.parse(data);
  });
};

module.exports.calculateFanStatus = (config, device, sensor) => {

  var targetTemp = device.target_temperature_c;
  var currentTemp = device.ambient_temperature_c;
  var sensorTemp = sensor;

  console.log(util.format('currentTemp: %s targetTemp: %s sensorTemp :%s fanState: %s currentVsTargetTol: %s sensorVsNestTol: %s ',
    currentTemp, targetTemp, sensorTemp, device.hvac_fan_state, config.currentVsTargetTolerance, config.sensorVsNestTolerance));

  if (device.hvac_mode === 'off') {
    console.log('Nest is off. Ignoring temperatures.');
    return false;
  }

  if (device.hvac_mode === 'eco') {
    console.log('Auto away active. Ignoring temperatures.');
    return false;
  }

  if (Math.abs(targetTemp - currentTemp) > config.currentVsTargetTolerance) {
    console.log('The current temperature and target temperature are too far apart. We will automatically run the fan soon. Ignoring sensor temperature.');
    return false;
  }

  //We test against the target temperature not the current temperature because current temperature will have less predictable shifts. 
  if (Math.abs(targetTemp - (sensorTemp + config.sensorAdjustment)) > config.sensorVsNestTolerance) {
    console.log('The target temperature and sensor temperature are too far apart. We should run the fan.');
    return true;
  }

  console.log('The target temperature and sensor temperature are too close. We should switch the fan to auto.');
  return false;

};

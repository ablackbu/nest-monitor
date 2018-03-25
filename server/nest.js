'use strict';

const _ = require('lodash');
const http = require('request-promise');
const common = require('./common');

module.exports.requestNestDataAndSetFan = (config) => {
  return _getNestStatus(config.token, config.deviceId).then(status => {
    return common.getSensorTemperature(config.sensorFile).then(sensorTemp => {
      return _setNestFanMode(config.token, config.deviceId,
        common.calculateFanStatus(config, status, sensorTemp));
    });
  });
};

const _getNestStatus = (token, deviceId) => {
  const uri = 'https://developer-api.nest.com/';
  const options = _getHttpOptions(uri, 'GET', token);
  return http.get(options).then(res => {
    return  _.get(res, 'devices.thermostats.' + deviceId);
  });
};

const _setNestFanMode = (token, deviceId, isOn) => {
  const uri = 'https://developer-api.nest.com/devices/thermostats/' + deviceId;
  var options = _getHttpOptions(uri, 'PUT', token);
  _.set(options, 'body', {fan_timer_active: isOn});
  return http.put(options);
};

const _getHttpOptions = (uri, method, token) => {
  return {
    uri: uri,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      bearer: token
    },
    json: true,
    followAllRedirects: true,
    followOriginalHttpMethod: true
  };
};

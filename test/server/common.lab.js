'use strict';

const Code = require('code');
const Lab = require('lab');
const lab = module.exports.lab = Lab.script();
const expect = Code.expect;

const testee = require('../../server/common');

lab.experiment('server/common', () => {

  lab.experiment('getSensorTemperature', () => {

    lab.test('read invalid file', (done) => {
      testee.getSensorTemperature('./fixtures/not_a_file').
        then((temp) => {
          Code.fail('Should not happen.');
          done();
        }).catch((err) => {
          done();
        });
    });

    lab.test('read valid file', (done) => {
      testee.getSensorTemperature('./test/fixtures/w1_slave_test').
        then((temp) => {
          expect(temp).to.be.equal(25.437);
          done();
        }).catch((err) => {
          Code.fail('Should not happen');
        });
    });
  });

  lab.experiment('getConfig', () => {
    lab.test('./test/fixtures/not_a_file', (done) => {
      testee.getConfig().then((config) => {
        Code.fail('Should not happen.');
        done();
      }).catch((err) => {
        done();
      });
    });

    lab.test('valid config file.', (done) => {
      testee.getConfig('./test/fixtures/config.json').then((config) => {
        expect(config.username).to.be.equal('user@domain.com');
        expect(config.password).to.be.equal('password');
        expect(config.sensorFile).to.be.equal('./sensor/path');
        expect(config.sensorAdjustment).to.be.equal(0.5);
        expect(config.currentVsTargetTolerance).to.be.equal(0.5);
        expect(config.sensorVsNestTolerance).to.be.equal(2.0);
        expect(config.nestCheckFrequency).to.be.equal(5);
        done();
      });

    });

  });

  lab.experiment('calculateFanStatus', () => {

    var config = {};
    config.currentVsTargetTolerance = 0.5;
    config.sensorVsNestTolerance = 2.0;
    config.sensorAdjustment = 0.0;


    lab.test('isOff', (done) => {
      var device = {};
      var sensor = 10;
      device.target_temperature_type = 'off'; // eslint-disable-line camelcase
      expect(testee.calculateFanStatus(config, device, sensor)).to.be.false();
      done();
    });

    lab.test('isAutoAway', (done) => {
      var device = {};
      var sensor = 10;
      device.auto_away = 1; // eslint-disable-line camelcase
      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.false();
      done();
    });

    lab.test('nestManuallyTriggeringSoon 1', (done) => {
      var device = {};
      var sensor = 10;
      device.auto_away = 0; // eslint-disable-line camelcase
      device.target_temperature = 20; // eslint-disable-line camelcase
      device.current_temperature = 19; // eslint-disable-line camelcase

      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.false();
      done();
    });

    lab.test('nestManuallyTriggeringSoon 2', (done) => {
      var device = {};
      var sensor = 10;
      device.auto_away = 0; // eslint-disable-line camelcase
      device.target_temperature = 19; // eslint-disable-line camelcase
      device.current_temperature = 20; // eslint-disable-line camelcase

      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.false();
      done();
    });

    lab.test('needToRunFan too cold', (done) => {
      var device = {};
      var sensor = 15;
      device.auto_away = 0; // eslint-disable-line camelcase
      device.target_temperature = 20; // eslint-disable-line camelcase
      device.current_temperature = 20; // eslint-disable-line camelcase

      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.true();
      done();
    });

    lab.test('needToRunFan too hot', (done) => {
      var device = {};
      var sensor = 25;
      device.auto_away = 0; // eslint-disable-line camelcase
      device.target_temperature = 20; // eslint-disable-line camelcase
      device.current_temperature = 20; // eslint-disable-line camelcase

      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.true();
      done();
    });

    lab.test('autoFan sensor and target are close enough', (done) => {
      var device = {};
      var sensor = 21.5;
      device.auto_away = 0; // eslint-disable-line camelcase
      device.target_temperature = 20; // eslint-disable-line camelcase
      device.current_temperature = 20; // eslint-disable-line camelcase

      expect(testee.calculateFanStatus(config, device,  sensor)).to.be.false();
      done();
    });



  });


});





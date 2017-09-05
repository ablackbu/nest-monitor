const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports.getSensorTemperature  = (sensorFile) => {
    return new Promise ((resolve, reject) => {
        fs.readFileAsync(sensorFile).then((data)=> {
            var dataArray = data.toString('ascii').split(" "); // Split by space
            var temp  = parseFloat(dataArray[dataArray.length-1].split("=")[1])/1000.0;
            resolve(temp);
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.getConfig = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile('./config.json', (err, data) => {
            if (err) reject(err);
            resolve(JSON.parse(data));
        });
    });
};

module.exports.calculateFanStatus = (device, sensor) => {

    var targetTemp = device.target_temperature;
    var currentTemp = device.current_temperature;
    var hvacFan = device.hvac_fan_state;
    var sensorTemp = sensor;

    console.log("targetTemp: " + targetTemp);
    console.log("currentTemp: " + currentTemp);
    console.log("hvacFan: " + hvacFan);
    console.log("sensorTemp: " + sensorTemp)
    
    if(device.auto_away == 1) { 
        console.log('Auto away active ignoring temperatures.');
        return false;
    }

    ;
    
    if(Math.abs(targetTemp-currentTemp) > currentVsTargetTolerance) {
        console.log('The current temperature and target temperature are too far apart. This means nest will automatically run the fan soon. Ignoring sensor temperature.');
        return false;
    }

    //We test against the target temperature not the current temperature because current temperature will have less predictable shifts. 
    if(Math.abs(targetTemp - (sensorTemp+sensorAdjustment)) > sensorVsNestTolerance) {
        console.log('The target temperature and sensor temperature are too far apart. Nest should run the fan.');
        return true;
    } else {
        console.log('The target temperature and sensor temperature are too close. Nest should switch the fan to auto.');
        return false;
    }
    
};

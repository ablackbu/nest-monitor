
//Dependencies

const fs = require('fs');
const nest = require('unofficial-nest-api');
const util = require('util');
const Promise = require('bluebird');


//Config. Move me to a config.json at some point. 
const sensorFile = '/sys/bus/w1/devices/<your_sensor_id/w1_slave';
const username = 'username@domain.com';
const password = 'password';
const sensorAdjustment = 0.5; //this is an offset. That means this can be negative.
const currentVsTargetTolerance = 0.5; //This is a range. this is expected to be postitive
const sensorVsNestTolerance = 2.0; //This is a range. this is expected to be positive.
const nestCheckFrequency = 5; //how frequent we check in minutes

//All temps are in c

const getSensorInfo = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile(sensorFile, (err, data) => {
            if (err) reject(err);
            var dataArray = data.toString('ascii').split(" "); // Split by space
            var temp  = parseFloat(dataArray[dataArray.length-1].split("=")[1])/1000.0;
            resolve(temp);
        });
    });
};

const shouldFanRun = (device, sensor) => {
    
    if(device.auto_away == 1) { 
        console.log('Auto away active ignoring temperatures.');
        return false;
    }

    var targetTemp = device.target_temperature;
    var currentTemp = device.current_temperature;
    var hvacFan = device.hvac_fan_state;
    var sensorTemp = sensor;

    console.log("targetTemp: " + targetTemp);
    console.log("currentTemp: " + currentTemp);
    console.log("hvacFan: " + hvacFan);
    console.log("sensorTemp: " + sensorTemp);
    
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


//I wanted to break these apart but it appears the node nest api needs to have these 
//nested. Maybe more testing to confirm but it seemed my datasets were coming back null
//would like to promisify all of these out
const checkNestInfo = () => {
    nest.login(username, password, (err, data) => {
        if(err) {
            console.log(err.message);
            process.exit(1);
            return;
        }
        console.log('logged in');

        nest.fetchStatus((data) => {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
                    getSensorInfo().then((sensorTemp) => {
                        console.log('Checking if fan should run...');
                        //shouldFanRun(device, sensorTemp) ? nest.setFanModeOn() : nest.setFanModeAuto();
                        console.log(shouldFanRun(device, sensorTemp));
                    }).catch((err) => {
                        console.log(err);
                    });

                    
                }
            }
        }); 


    });
    
};

//Not sure I I want to move this around some other way.
const mainLoop = () => {
    //Converts the minutes to millis
    //var interval = nestCheckFrequency*60*1000;
    //setInterval(() => { checkNestInfo();}, interval);
    checkNestInfo();
};
mainLoop();

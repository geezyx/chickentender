var mraa = require ('mraa');
var LCD  = require ('jsupm_i2clcd');
console.log('Current version of MRAA is', mraa.getVersion());

var light = new mraa.Aio(0);
var lightValue;
var lcdMessage=" ";
var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);
var B = 3975;
var myAnalogPin = new mraa.Aio(0);

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("/dev/ttyMFD1", {
  baudrate: 19200,
  parser: serialport.parsers.readline("\n")
});

var exec = require('child_process').exec,
    child;

function startSensorWatch() {
    'use strict';
    var a = myAnalogPin.read();
        //console.log("Analog Pin (A0) Output: " + a);
        //console.log("Checking....");
        
    var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    //console.log("Resistance: "+resistance);
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
    //console.log("Celsius Temperature "+celsius_temperature); 
    var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
    console.log("Fahrenheit Temperature: " + Math.round(fahrenheit_temperature));
    var temperature = fahrenheit_temperature.toString();
    return temperature;
}


sp.on("data", function (data) {
    myLCD.setCursor(0,1);
    myLCD.write(startSensorWatch());
    myLCD.setColor(randomInt(0,255), randomInt(0,255), randomInt(0,255));
    
    child = exec('/usr/bin/python /home/root/scale.py',
        function (error, stdout, stderr) {
            myLCD.setCursor(1,1);
            myLCD.write(stdout);
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
});
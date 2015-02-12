var mraa = require ('mraa');
var LCD  = require ('jsupm_i2clcd');
console.log('Current version of MRAA is', mraa.getVersion());

var light = new mraa.Aio(0);
var lightValue;
var lcdMessage=" ";
var myLCD = new LCD.Jhd1313m1(6, 0x3E, 0x62);

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



sp.on("data", function (data) {
    myLCD.setCursor(0,1);
    myLCD.write(data);
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
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

// UDP Options
var options = {
    host : '127.0.0.1',
    port : 41234
};

function registerNewSensor(name, type, callback){
    var msg = JSON.stringify({
        n: name,
        t: type
    });

    var sentMsg = new Buffer(msg);
    console.log("Registering sensor: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, options.port, options.host, callback);
};

function sendObservation(name, value, on){
    var msg = JSON.stringify({
        n: name,
        v: value,
        on: on
    });

    var sentMsg = new Buffer(msg);
    console.log("Sending observation: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, options.port, options.host);
};

client.on("message", function(mesg, rinfo){
    console.log('UDP message from %s:%d', rinfo.address, rinfo.port);
    var a = JSON.parse(mesg);
    console.log(" m ", JSON.parse(mesg));

    if (a.b == 5) {
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST +':'+ PORT);
            // client.close();

        });
    }
});





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
            var data = [{
                sensorName : "scale",
                observations: [{
                    on: new Date().getTime(),
                    value: parseFloat(stdout)
                }]
            }];
            data.forEach(function(item) {
                    item.observations.forEach(function (observation) {
                            sendObservation(item.sensorName, observation.value, observation.on);
                    });
            });
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
});
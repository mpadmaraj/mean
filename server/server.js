var express = require("express");
var app = express();
//var addon = require('bindings')('addon');
//var addon = require('./build/Release/addon');
var mongoose= require("mongoose");
var cors = require("cors");
var mqtt = require('mqtt'), url = require('url');
var mqtt_url = url.parse("mqtt://ibuyeqzl:oGtoeTGQPI5b@m11.cloudmqtt.com:16828");
var auth = (mqtt_url.auth || ':').split(':');
// create mqtt connection
var client = mqtt.createClient(mqtt_url.port, mqtt_url.hostname, {
    username: auth[0],
    password: auth[1]
});

var i2c = require('i2c');
var device1 = new i2c(0x18, {device: '/dev/i2c-1', debug: false});
device1.setAddress(0x4);

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
    baudrate: 9600
}, false); // this is the openImmediately flag [default is true]

var recievedSerialData,measuredData;

serialPort.open(function (error) {
    if ( error ) {
        console.log('failed to open: '+error);
    } else {
        console.log('open');
        serialPort.on('data', function(data) {
            recievedSerialData=data;
            console.log('data received: ' + data);
        });
    }
});


client.on('connect', function() { // When connected

    // listening to request to measure
    client.subscribe('hk/machines/rasp1', function() {
        // request to measure has come....
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
//            var measuredData =JSON.parse(addon.measure());
            //wait 2 minutes for the BP reading to finish...
            setTimeOut(function(){
                //reset arduino so that it can open UART communication with BP machine and read the reading
                device1.writeByte(0x2, function(err) { });
                setTimeOut(function(){
                    //Getting the latest data we got from Arduino on serial port
                    measuredData =JSON.parse(recievedSerialData);
                    //TODO:This needs to be read from the mqtt request
                    measuredData.username="demouser";
                    measuredData.machine="rasp1";
                    client.publish('hk/machines/results', JSON.stringify(measuredData) , function() {
                        console.log("Message is published1");
                    });

                }, 10000);

            }, 120000);
        });
    });

    //publish to admin module that machine is up
    client.publish('hk/machines', 'rasp1', function() {
        console.log("Message is published");
        //  client.end(); // Close the connection when published
    });
    //publish to admin module that machine is up
    var id = setInterval(function(){
        client.publish('hk/machines', 'rasp1', function() {
            console.log("Message is published");
        });
    }, 60000);

});

app.use(cors());
mongoose.connect("mongodb://paddy:123456@ds049997.mongolab.com:49997/arduino");

//var Product= mongoose.model('Product',{name:String});
//app.get("/",function(req,res){
    //Product.find(function(err,products){
    //    res.send(products);
    //})
    //  var first_num = req.param("first_num");
    //  var second_num = req.param("second_num");
    //  var s = addon.add(3, 5);
    //  res.json({value:s });

//});
app.listen(3001);
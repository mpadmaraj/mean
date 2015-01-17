var express = require("express");
var app = express();
var PythonShell = require('python-shell');
var addon = require('bindings')('addon.node');
//var addon = require('../build/Release/addon');
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

var measuredData={};
var bpmeasure=0;
var options={};
client.on('connect', function() { // When connected

    // listening to request to measure
    client.subscribe('hk/machines/rasp1', function() {
        // request to measure has come....
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
            measuredData= JSON.parse(addon.getReadings());
            //TODO:This needs to be read from the mqtt request
            measuredData.username="demouser";
            measuredData.machine="rasp1";
            options = {
                mode: 'text',
                args: [1]
            };

            PythonShell.run('i2c.py', options, function (err, results) {
                if (err) throw err;
                // results is an array consisting of messages collected during execution
                console.log('results: %j', results);
            });
            //wait 10 secon for the BP reading to finish...
            setTimeout(function(){
                options = {
                    mode: 'text',
                    args: [2]
                };
                PythonShell.run('i2c.py', options, function (err, results) {
                    if (err) throw err;
                    // results is an array consisting of messages collected during execution
                    console.log('results: %j', results);
                    measuredData.systolic=results[0];
                });
                setTimeout(function(){
                    options = {
                        mode: 'text',
                        args: [3]
                    };
                    PythonShell.run('i2c.py', options, function (err, results) {
                        if (err) throw err;
                        // results is an array consisting of messages collected during execution
                        console.log('results: %j', results);
                        measuredData.diastolic=results[0];
                        console.log(JSON.stringify(measuredData));
                        client.publish('hk/machines/results', JSON.stringify(measuredData) , function() {
                            console.log("Message is published1");
                        });

                    });
                }, 2000);
            }, 10000);
        });
    });

    //publish to admin module that machine is up
    client.publish('hk/machines', 'rasp1', function() {
        console.log("Message is published");
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

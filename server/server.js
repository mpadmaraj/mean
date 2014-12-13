var express = require("express");
var app = express();
//var addon = require('bindings')('addon');
//var addon = require('./build/Release/addon');
var mongoose= require("mongoose");
var cors = require("cors");
var mqtt = require('mqtt'), url = require('url');
var mqtt_url = url.parse("mqtt://ibuyeqzl:oGtoeTGQPI5b@m11.cloudmqtt.com:16828");
var auth = (mqtt_url.auth || ':').split(':');
// Create a client connection
var client = mqtt.createClient(mqtt_url.port, mqtt_url.hostname, {
    username: auth[0],
    password: auth[1]
});

client.on('connect', function() { // When connected

    // subscribe to a topic
    client.subscribe('hk/client', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });
    });
    client.publish('hk/machines', 'rasp1', function() {
        console.log("Message is published");
        //  client.end(); // Close the connection when published
    });
    var id = setInterval(function(){
        client.publish('hk/machines', 'rasp1', function() {
            console.log("Message is published");
          //  client.end(); // Close the connection when published
        });
    }, 60000);
    // publish a message to a topic

});

app.use(cors());
mongoose.connect("mongodb://paddy:123456@ds049997.mongolab.com:49997/arduino");

var Product= mongoose.model('Product',{name:String});
app.get("/",function(req,res){
    //Product.find(function(err,products){
    //    res.send(products);
    //})
  //  var first_num = req.param("first_num");
  //  var second_num = req.param("second_num");
  //  var s = addon.add(3, 5);
  //  res.json({value:s });

});
app.listen(3001);
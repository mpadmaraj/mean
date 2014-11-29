var express = require("express");
var app = express();
var addon = require('bindings')('addon');
//var addon = require('./build/Release/addon');
var mongoose= require("mongoose");
var cors = require("cors");
app.use(cors());
mongoose.connect("mongodb://paddy:123456@ds049997.mongolab.com:49997/arduino");

var Product= mongoose.model('Product',{name:String});
app.get("/",function(req,res){
    //Product.find(function(err,products){
    //    res.send(products);
    //})
    var first_num = req.param("first_num");
    var second_num = req.param("second_num");
    var s = addon.add(3, 5);
    res.json({value:s });

});
app.listen(3000);
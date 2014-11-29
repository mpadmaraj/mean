var mean = angular.module("mean",[]);

mean.controller("MeanCtrl",function($http){
    //var app=this;
    $http({
        method: 'GET',
        url: 'http://localhost:3000',
        params: {first_num: 3,second_num:4}
    }).success(function(data){
        // With the data succesfully returned, call our callback
        console.log(data)
    }).error(function(){
        alert("error");
    });
     //$http.get("http://localhost:3000").success(function(msgs){
     //    scope.msgs= msgs;
     //})
});
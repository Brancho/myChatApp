'use strict';

/* Controllers */

angular
  .module('chatApp.controllers', [])
  .controller('sidebarCtrl', sidebarCtrl)
  .controller('accountCtrl', accountCtrl)
  .controller('chatCtrl', chatCtrl)
  .controller('chatPrivateCtrl', chatPrivateCtrl);

function chatCtrl($scope, socket, $state, $stateParams, $rootScope, $http) {

  $scope.activeChannel = $stateParams.handle;

  $http.get('/messages/' + $scope.activeChannel).success(function(data){
    $scope.messages = data || [];
  });


  socket.on('new:message', function(data){
    console.log('new message recieved');
    if(data.channel == $scope.activeChannel){
      $scope.messages.push(data);
    }
  });

  $scope.sendMessage = sendMessage;

  function sendMessage(){
    console.log('Sending message');

    var data = {
      message: $scope.message,
      user: $rootScope.user,
      channel: $scope.activeChannel
    };

    $scope.messages.push(data);
    socket.emit('send:message', data);
    $scope.message = "";
  }


}


function chatPrivateCtrl($scope, socket, $state, $stateParams, $rootScope, $rootScope) {

  $scope.id = $stateParams.id;

  var privateKey = _.sortBy([$rootScope.user.id, $scope.id], function(num){ return num }).join('');

  socket.emit('get:private:messages', { key: privateKey});

  $scope.messages = [];

  socket.on('init:private:messages', function(data){
    $scope.messages = data || [];
  });

  socket.on('new:private:message', function(data){
    if(data.user.id == $scope.id) {
      $scope.messages.push(data);
    }else{
    }
  });

  $scope.sendMessage = sendMessage;

  function sendMessage(){

    var data = {
      message: $scope.message,
      to: $scope.id,
      user: $rootScope.user
    };

    $scope.messages.push(data);
    socket.emit('send:private:message', data);
    $scope.message = "";
  }


}

function sidebarCtrl($scope, $rootScope, socket) {

  $scope.channels = [
    { name: '# general', handle: 'general' },
    { name: '# random', handle: 'random' }
  ];

  socket.on('frontend:user:change', function(data){
    $rootScope.activeUsers = data.users;
  });

}


function accountCtrl($scope, $rootScope, socket, $state, toastr) {

  $scope.user = {};
  $scope.submitAccount = submitAccount;

  function submitAccount(){
    var user = {
      full_name: $scope.user.full_name,
      email: $scope.user.email,
      handle: "@" + $scope.user.handle,
      initials: makeInitials($scope.user)
    };
    if(!$rootScope.user){
      socket.emit('user:init', user);
    }else{
      socket.emit('user:update', user);
    }
  }

  socket.on('init:chat', function(data){
    if(data.success){
      $rootScope.user = data.data.current_user;
      $rootScope.activeUsers = data.data.users;
      $state.go('chat-show', { handle: 'general'});
      toastr.success('Welcome to chat!', '');
    }else{
      $scope.user.handle = "";
      toastr.error('Bad handle', '');
    }
  });

  socket.on('frontend:user:left', function(data){
    toastr.info('User left', data);
    $rootScope.activeUsers = data.users;
  });

  function makeInitials(user){
    var res = user.full_name.split(" ");

    var initialsA = _.map(res, function(x){
      return x[0].toUpperCase();
    });

    return initialsA.join('');




  }





}


//  .controller('AppCtrl', function ($scope, socket) {
//  socket.on('send:name', function (data) {
//    $scope.name = data.name;
//  });
//})
//
//  .controller('MyCtrl1', function ($scope, socket) {
//  socket.on('send:time', function (data) {
//    $scope.time = data.time;
//  });
//})
//  .controller('MyCtrl2', function ($scope) {
//  // write Ctrl here
//});

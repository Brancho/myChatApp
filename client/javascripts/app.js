'use strict';

// Declare app level module which depends on filters, and services

angular.module('chatApp', [
  'ui.router',
  'toastr',
  'chatApp.controllers',
  'chatApp.filters',
  'chatApp.services',
  'chatApp.directives',

  // 3rd party dependencies
  'btford.socket-io'
])
  .run(appInit)
  .config(appConfig);



function appInit($rootScope, $state, $location){

  if(!$rootScope.user){
    $location.path('/account');
  }

}

function appConfig($stateProvider, $urlRouterProvider){

  $urlRouterProvider.otherwise("/chat");


  $stateProvider
    .state('chat', {
      url: "/chat",
      controller: 'chatCtrl',
      templateUrl: "/templates/chat.html"
    })

    .state('chat-show', {
      url: "/chat/:handle",
      controller: 'chatCtrl',
      templateUrl: "/templates/chat.html"
    })

    .state('chat-private', {
      url: "/dm/:id",
      controller: 'chatPrivateCtrl',
      templateUrl: "/templates/chat.html"
    })

    .state('account', {
      url: "/account",
      controller: 'accountCtrl',
      templateUrl: "/templates/account.html"
    })

}
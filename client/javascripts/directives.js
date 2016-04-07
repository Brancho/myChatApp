'use strict';

/* Directives */

angular.module('chatApp.directives', [])
  .directive('appVersion', function (version) {
  return function (scope, elm, attrs) {
    elm.text(version);
  };
});
'use strict';

angular.module('myApp.version', [
  'myApp.version.interpolate-filter',
  'myApp.version.version-directive',
  'myApp.version.controllers'
])

.value('version', '0.1');

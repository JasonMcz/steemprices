'use strict';

angular.module('myApp.version.version-directive', [])

.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}])

/* Directives */

.directive('highlighter', function ($timeout) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
              scope.$watch(attrs.highlighter, function (nv, ov) {
                  if (nv !== ov) {
                      if (Number(nv) <= (ov)) {
                        element.css('background-color', '#FF6939');
                        element.css('transition','background 200ms');
                      } else {
                        element.css('background-color', '#50B949');
                        element.css('transition','background 200ms');
                      }
                      $timeout(function () {
                          if (element.css('background-color')!='#fff') {
                            element.css('background-color', '#fff');
                            element.css('transition','background 200ms');
                          }
                      }, 1500);
                  }
              });
          }
      };
  });

angular.module('ui.bootstrap.tabs', [])
.controller('TabsController', ['$scope', '$element', function($scope, $element) {
  var panes = $scope.panes = [];

  this.select = $scope.select = function selectPane(pane) {
    angular.forEach(panes, function(pane) {
      pane.selected = false;
    });
    pane.selected = true;
  };

  this.addPane = function addPane(pane) {
    if (!panes.length) {
      $scope.select(pane);
    }
    panes.push(pane);
  };

  this.removePane = function removePane(pane) { 
    var index = panes.indexOf(pane);
    panes.splice(index, 1);
    //Select a new pane if removed pane was selected 
    if (pane.selected && panes.length > 0) {
      $scope.select(panes[index < panes.length ? index : index-1]);
    }
  };
}])
.directive('tabs', function() {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {},
    controller: 'TabsController',
    templateUrl: 'template/tabs/tabs.html',
    replace: true
  };
})
.controller('PaneController', ['$scope', function($scope) {
  this.setHeading = function(element) {
    $scope.headingElement = element;
  };
}])
.directive('pane', ['$parse', function($parse) {
  return {
    require: '^tabs',
    restrict: 'EA',
    transclude: true,
    templateUrl: 'template/tabs/pane.html',
    replace: true,
    controller: 'PaneController',
    scope: {
      heading: '@'
    },
    link: function(scope, element, attrs, tabsCtrl) {
      var getSelected, setSelected;
      scope.selected = false;
      if (attrs.active) {
        getSelected = $parse(attrs.active);
        setSelected = getSelected.assign;
        scope.$watch(
          function watchSelected() {return getSelected(scope.$parent);},
          function updateSelected(value) {scope.selected = value;}
        );
        scope.selected = getSelected ? getSelected(scope.$parent) : false;
      }
      scope.$watch('selected', function(selected) {
        if(selected) {
          tabsCtrl.select(scope);
        }
        if(setSelected) {
          setSelected(scope.$parent, selected);
        }
      });

      tabsCtrl.addPane(scope);
      scope.$on('$destroy', function() {
        tabsCtrl.removePane(scope);
      });
    }
  };
}])
.directive('paneHeading', ['$timeout', '$compile', function($timeout, $compile) {
  return {
    restrict: 'EA',
    transclude: true, //We'll take the contents of this and use it as the heading
    template: '', //basically remove this element
    replace: true,
    compile: function(elm, attrs, transclude) {
      return function postLink(scope, elm, attrs) {
        // If we do `require: '^pane' or require: 'pane' it simply cannot find
        // the pane controller. Probably because the <pane-heading> element is
        // compiled before its parent <pane> element (?)
        // I also tried doing `terminal: true` on the paneHeading, but that
        // didn't make any difference since terminal really only effects
        // the order of directives-on-same-element compilation.
        //
        // For now, to get around the problem we have a $timeout so the paneHeading
        // can wait until the pane compiles.
        $timeout(function() { 
          var pane = elm.parent().scope();
          pane.headingElement = transclude(scope);
        });
      };
    }
  };
}])
.directive('paneHeadingTransclude', [function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var pane = scope.$eval(attrs.paneHeadingTransclude);
      pane.$watch('headingElement', function(heading) { 
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}]);

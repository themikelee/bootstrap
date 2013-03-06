angular.module('ui.bootstrap.tabs', [])

.controller('TabsController', ['$scope', function($scope) {
  var ctrl = this;
  var panes = $scope.panes = [];

  this.select = $scope.select = function selectPane(pane) {
    angular.forEach(panes, function(pane) {
      pane.selected = false;
    });
    pane.selected = true;
    ctrl.selectedPane = pane;
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

.directive('tabs', [function() {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {},
    controller: 'TabsController',
    templateUrl: 'template/tabs/tabs.html',
    replace: true
  };
}])

.directive('pane', ['$parse', '$compile', function($parse, $compile) {
  return {
    require: '^tabs',
    restrict: 'EA',
    transclude: true,
    templateUrl: 'template/tabs/pane.html',
    replace: true,
    controller: function() {}, //Empty controller so pane can be required
    scope: {
      heading: '@'
    },
    compile: function(elm, attrs, transclude) {
      return function link(scope, elm, attrs, tabsCtrl) {

        //Bind to `selected` attribute, if it exists
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

        //Set paneContent so paneContentTransclude can access
        //Transclude on parent scope, not our new isolated scope
        scope.paneContent = transclude(scope.$parent, angular.noop);

        tabsCtrl.addPane(scope);
        scope.$on('$destroy', function() {
          tabsCtrl.removePane(scope);
        });

        //Set select function for the markup to use
        scope.select = function() {
          tabsCtrl.select(scope);
        };
      };
    }
  };
}])

.directive('paneHeading', [function() {
  return {
    restrict: 'EA',
    template: '', //In effect remove this element
    transclude: true,
    replace: true,
    compile: function(elm, attrs, transclude) {
      return function link(scope, elm, attrs) {
        //We can't require paneCtrl here because <pane-heading> element
        //ends up getting compiled outside pane directive, in the tab's
        //content area
        scope.paneHeading = transclude(scope, angular.noop);
      };
    }
  };
}])

.directive('paneHeadingTransclude', ['$compile', function($compile) {
  return {
    restrict: 'A',
    require: '^pane',
    link: function(scope, elm, attrs, paneCtrl) {
      scope.$parent.$watch('paneHeading', function(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}])

.directive('paneContentTransclude', [function() {
  return {
    restrict: 'A',
    require: '^tabs',
    link: function(scope, elm, attrs, tabsCtrl) {
      scope.$watch(function() {
        return tabsCtrl.selectedPane;
      }, function(pane) {
        if (pane) {
          elm.html('');
          elm.append(pane.paneContent);
        }
      });
    }
  };
}]);

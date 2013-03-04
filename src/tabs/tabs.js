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

.controller('PaneController', ['$scope', function($scope) {
}])

.directive('pane', ['$parse', function($parse) {
  return {
    require: '^tabs',
    restrict: 'EA',
    transclude: true,
    templateUrl: 'template/tabs/pane.html',
    replace: true,
    scope: {
      heading: '@'
    },
    controller: 'PaneController',
    compile: function(elm, attrs, transclude) {
      return function link(scope, elm, attrs, tabsCtrl) {

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

        scope.paneContent = transclude(scope, angular.noop);

        tabsCtrl.addPane(scope);
        scope.$on('$destroy', function() {
          tabsCtrl.removePane(scope);
        });

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

.directive('paneHeadingTransclude', [function() {
  return {
    restrict: 'A',
    require: '^pane',
    link: function(scope, elm, attrs, paneCtrl) {
      scope.$watch('paneHeading', function(html) {
        if (html) {
          elm.html('');
          elm.append(html);
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

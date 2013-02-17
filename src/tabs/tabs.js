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
    compile: function(element, attrs, transclude) {
      return function postLink(scope, element, attrs, tabsCtrl) {
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
        
        // Allow child 'pane-heading' (class, attribute, or element)
        // to define a pane heading with HTML in it.
        // We don't use a child directive the child <pane-heading>
        // directive wasn't able to find a parent pane controller (?)
        transclude(scope.$parent, function(clone) {
          // The clone is an angular collection of all the <pane> element's children,
          // so we forEach it
          angular.forEach(clone, function(child) {
            //If child is an element, go forward (sometimes it can just be text)
            if (child.tagName) { 
              var $child = angular.element(child);
              if ($child[0].tagName.toLowerCase() == "pane-heading" ||
                  $child.hasClass("pane-heading") ||
                  $child.attr("pane-heading") !== undefined) {
                scope.headingElement = $child;
                $child.remove();
              }
            }
          });
          element.append(clone);
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

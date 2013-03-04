describe('tabs', function(){
  var scope, elm, $compile;
  beforeEach(module('ui.bootstrap.tabs'));
  beforeEach(module('template/tabs/tabs.html', 'template/tabs/pane.html'));

  beforeEach(inject(function(_$compile_, $rootScope) {
    $compile = _$compile_;
    scope = $rootScope.$new();
  }));

  function create(tpl) {
    var el = $compile(tpl)(scope);
    scope.$apply();
    return el;
  }

  it('should have tabs template', function() {
    elm = create('<tabs></tabs>');
    expect(elm.find('ul.nav-tabs').length).toBe(1);
    expect(elm.find(".tab-content").length).toBe(1);
  });

  describe('pane heading', function() {
    beforeEach(function() {
      elm = create('<tabs>' +
        '<pane heading="Hello"></pane>' +
        '<pane><pane-heading><b>Hello</b></pane-heading></pane>' +
      '</tabs>');
    });

    it('should transclude panes into list', function() {
      expect(elm.find('ul li a').length).toBe(2);
    });

    it('should have pane heading attribute as content', function() {
      var first = elm.find('ul li a').first();
      expect(first.text()).toBe('Hello');
    });

    it('should transclude <pane-heading>', function() {
      var second = elm.find('ul li a').eq(1);
      var heading = second.children().first();
      expect(heading.is('b')).toBe(true);
      expect(heading.text()).toBe('Hello');
    });
  });

  describe('pane content', function() {
    beforeEach(function() {
      elm = create('<tabs>' +
        '<pane>Hello, pane!</pane>' +
        '<pane><b>What?</b></pane>' +
      '</tabs>');
    });
    
    it('should bind pane content of only one pane at a time', function() {
      var content = elm.find('.tab-content > .tab-pane').children();
      expect(content.is('span')).toBe(true);
      expect(content.text()).toBe('Hello, pane!');
    });

  });
});

describe('tabs controller', function() {

  var scope, ctrl;

  beforeEach(module('ui.bootstrap.tabs'));
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope;

    // instantiate the controller stand-alone, without the directive
    ctrl = $controller('TabsController', {$scope: scope, $element: null});
  }));


  describe('select', function() {

    it('should mark given pane selected', function() {
      var pane = {};

      scope.select(pane);
      expect(pane.selected).toBe(true);
    });


    it('should deselect other panes', function() {
      var pane1 = {}, pane2 = {}, pane3 = {};

      ctrl.addPane(pane1);
      ctrl.addPane(pane2);
      ctrl.addPane(pane3);

      scope.select(pane1);
      expect(pane1.selected).toBe(true);
      expect(pane2.selected).toBe(false);
      expect(pane3.selected).toBe(false);

      scope.select(pane2);
      expect(pane1.selected).toBe(false);
      expect(pane2.selected).toBe(true);
      expect(pane3.selected).toBe(false);

      scope.select(pane3);
      expect(pane1.selected).toBe(false);
      expect(pane2.selected).toBe(false);
      expect(pane3.selected).toBe(true);
    });
  });


  describe('addPane', function() {

    it('should append pane', function() {
      var pane1 = {}, pane2 = {};

      expect(scope.panes).toEqual([]);

      ctrl.addPane(pane1);
      expect(scope.panes).toEqual([pane1]);

      ctrl.addPane(pane2);
      expect(scope.panes).toEqual([pane1, pane2]);
    });


    it('should select the first one', function() {
      var pane1 = {}, pane2 = {};

      ctrl.addPane(pane1);
      expect(pane1.selected).toBe(true);

      ctrl.addPane(pane2);
      expect(pane1.selected).toBe(true);
    });
  });
});

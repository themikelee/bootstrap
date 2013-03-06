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
      var content = elm.find('.tab-content > .tab-pane');
      expect(content.text()).toBe('Hello, pane!');
    });
  });

  ddescribe('pane with ng-repeat and content', function() {
    beforeEach(function() {
      scope.panes = [
        {content: 'Bananas!', heading: 'Basil?'},
        {content: 'Cantelope!', heading: 'Carrot?'}
      ];
      elm = create('<tabs>' +
        '<pane heading="Avacado?">Apple!</pane>' +
        '<pane ng-repeat="p in panes">' +
          '<pane-heading>{{p.heading}}</pane-heading>' +
          '{{p.content}}' +
        '</pane>' +
        '<pane><pane-heading>Dewberry?</pane-heading>Date!</pane>' +
      '</tabs>');
        scope.$apply();
    });

    iit('should bind content of first pane and four titles', function() {
      var titles = elm.find('.nav-tabs').children();
      var content = elm.find('.tab-content .tab-pane');

      expect(titles.length).toBe(4);

      expect(titles.eq(0)).toHaveClass('active');
      expect(titles.eq(0).text().trim()).toBe('Avacado?');
      expect(content.text()).toBe('Apple!');

      titles.eq(2).find('a').click();

      expect(titles.eq(2)).toHaveClass('active');
      expect(titles.eq(2).text().trim()).toBe('Carrot?');
      expect(content.text()).toBe('Cantelope!');
    });

  });

  it('should change active and content in pane when title clicked', function() {
    scope.first = 'a';
    scope.second = 'b';
    elm = create(
      '<div>' +
        '<tabs>' +
          '<pane heading="First Tab">' +
            'first content is {{$parent.first}}' +
          '</pane>' +
          '<pane>' +
            '<pane-heading>Second Tab</pane-heading>' +
            'second content is {{$parent.second}}' +
          '</pane>' +
        '</tabs>' +
      '</div>'
    );
    var titles = elm.find('ul.nav-tabs li');
    var contents = elm.find('div.tab-content div.tab-pane');

    // first content should be bound
    expect(contents.text()).toBe('first content is a');

    // click the second tab
    titles.eq(1).find('a').click();

    // second title should be active
    expect(titles.eq(0)).not.toHaveClass('active');
    expect(titles.eq(1)).toHaveClass('active');

    // second content should be bound
    expect(contents.text()).toBe('second content is b');
  });
});

describe('remote selection', function() {
  var elm, scope;

  // load the tabs code
  beforeEach(module('ui.bootstrap.tabs'));

  // load the templates
  beforeEach(module('template/tabs/tabs.html', 'template/tabs/pane.html'));

  beforeEach(inject(function($rootScope, $compile) {
    // we might move this tpl into an html file as well...
    elm = angular.element(
      '<div>' +
        '<tabs>' +
          '<pane ng-repeat="pane in panes" active="pane.active" heading="pane.title">' +
            '{{pane.content}}}' +
          '</pane>' +
        '</tabs>' +
      '</div>'
    );
    scope = $rootScope;
    scope.panes = [
      { title:"Dynamic Title 1", content:"Dynamic content 1", active:true},
      { title:"Dynamic Title 2", content:"Dynamic content 2" }
    ];

    $compile(elm)(scope);
    scope.$digest();
  }));

  it('should handle select attribute when select/deselect', function() {
    var titles = elm.find('ul.nav-tabs li');
    scope.$apply('panes[1].active=true');
    expect(titles.eq(1)).toHaveClass('active');

    titles.eq(0).find('a').click();
    
    expect(scope.panes[1].active).toBe(false);
  });

  it('should select last tab when multiple evaluate to active=true', function() {
    var titles = elm.find('ul.nav-tabs li');
    var contents = elm.find('.tab-content > .tab-pane');
    scope.$apply(function() {
      scope.panes[0].active = scope.panes[1].active = true;
    });
    expect(titles.eq(0)).not.toHaveClass('active');
    expect(titles.eq(1)).toHaveClass('active');
    expect(contents.text()).toBe('Dynamic Content 2');
  });

  it('should deselect all panes when all atrributes set to false', function() {
    var titles = elm.find('ul.nav-tabs li');
    scope.$apply('panes[0].active=false');
    expect(titles.eq(0)).not.toHaveClass('active');
    expect(titles.eq(1)).not.toHaveClass('active');
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

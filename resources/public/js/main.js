require(['jquery', 'transparency'], function($, Transparency) {
  var data = {
    greeting: 'My',
    name:     'skeleton'
  };

  jQuery.fn.render = Transparency.jQueryPlugin;
  $('#template').render(data);

});
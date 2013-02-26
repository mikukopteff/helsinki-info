require(['jquery', 'transparency'], function($, Transparency) {
  var data = {
    greeting: 'This is how I will roll',
    name:     'skeleton'
  };

  jQuery.fn.render = Transparency.jQueryPlugin;
  $('#template').render(data);

});
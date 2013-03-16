require(['jquery', 'transparency', 'bootstrap.min'], function($, Transparency) {
  var data = {
    greeting: 'Decision made - maybe!',
    name:     'Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.'
  };

  jQuery.fn.render = Transparency.jQueryPlugin;
  $('#template').render(data);

});
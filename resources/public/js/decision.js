require(['jquery', 'transparency', 'underscore-min','bootstrap.min'], function($, Transparency) {
  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('http://localhost:3000/events').done(
    function(json){
      $('#decision').render(_.first(json));
    });
});
require(['jquery', 'transparency', 'bootstrap.min'], function($, Transparency) {
  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('http://localhost:3000/events').done(
    function(json){
      $('#events').render(json);
    });
});
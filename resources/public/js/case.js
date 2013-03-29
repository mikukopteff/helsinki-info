require(['jquery', 'transparency', 'underscore-min','bootstrap.min'], function($, Transparency) {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('/event/' + getParameterByName("id")).done(
    function(json){
      $('#decision').render(json);
      $('#decision-details').render(json);
    });

});
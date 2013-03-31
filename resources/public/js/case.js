require.config({
    paths: {
        "moment": "moment.min",
    }
});

require(['jquery', 'transparency', 'moment','bootstrap.min'], function($, Transparency, moment, bootstrap) {

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

  function formatStrings(events) {
    events.publishTime = moment(events["publish-time"]).format('DD.MM.YYYY HH.mm');
    events.eventTime = moment(events["event-time"]).format('DD.MM.YYYY');
    events.headingDate = events.heading + ' ' + events.eventTime;
  }

  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('/event/' + getParameterByName("id")).done(
    function(events){
      formatStrings(events)
      console.log(events);
      $('#decision').render(events);
  });

});
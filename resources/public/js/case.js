require.config({
    paths: {
        "moment": "moment.min",
    }
});

require(['jquery', 'transparency', 'moment','bootstrap.min', 'underscore-min'], function($, Transparency, moment, bootstrap) {
var futureEventTextPrinted = false; //this is so ugly, god

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

  function formatStrings(event) {
    event.publishTime = moment(event['publish-time']).format('DD.MM.YYYY HH.mm');
    event.eventTime = moment(event['event-time']).format('DD.MM.YYYY');
    event.headingDate = event.heading + ' ' + event.eventTime;
  }

  directives = {
    headingDate: {
      "data-oid": function(params) {
        return this._id;
      },
      class: function(params) {
        if (moment(this['event-time']).isAfter(moment())) 
          return 'text-warning';  
      }
    }
  } 

  function onRelatedEventsFetch(events) {
    _.each(events, formatStrings);
    console.log(window.currentEvent);
    $('#related-events').render(events, directives);
    $('#related-events li [data-oid="' + window.currentEvent._id + '"]').parent().addClass('active');
    $('#related-events').prepend($('<li>Käsittelyhistoria</li>').addClass('nav-header'));//I hate the fact that I'm doing this. There should be a way to to this trasnparency.js

    //        <li class="nav-header">Käsittelyhistoria</li>
    //active         <li class="active"><a data-bind="headingDate" href="#"></a></li>
    //        <li class="nav-header">Tulevat käsittelyt</li>
        //<li><a class="text-warning" href="#">Valiokuntakäsittely 15.8.2013</a></li>
    window.relatedEvents = events;
  }

  function onEventFetch(event) {
    formatStrings(event);
    $('#event').render(event);
    window.currentEvent = event;
    $.ajax('/events/' + event['register-number']).done(onRelatedEventsFetch);
  }
  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('/event/' + getParameterByName("id")).done(onEventFetch);


});
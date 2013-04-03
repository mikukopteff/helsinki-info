require.config({
    paths: {
        "moment": "moment.min",
    }
});

require(['transparency', 'moment','bootstrap.min','jquery', 'underscore-min'], function(Transparency, moment, bootstrap, $) {

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
    $('#related-events .text-warning').before($('<li>Tulevat käsittelyt</li>').addClass('nav-header'));
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
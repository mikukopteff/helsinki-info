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

  function selectCurrentEvent(event) {
    $('#event-main').render(event);
    $('#event-detail').render(event);
    window.currentEvent = event;
  }

  function highlightCurrentEvent(event) {
    $('#related-events li').removeClass('active')
    $('#related-events li [data-oid="' + event._id + '"]').parent().addClass('active');
  } 

  function onRelatedEventSwitch(event) {
    var oid = event.currentTarget.childNodes[0].getAttribute('data-oid');
    var newEvent = _.find(window.relatedEvents, function(element){ return element._id === oid; })
    selectCurrentEvent(newEvent);
    highlightCurrentEvent(newEvent);
  }

  function onRelatedEventsFetch(events) {
    _.each(events, formatStrings);
    $('#related-events').render(events, directives);
    $('#related-events').prepend($('<li>Käsittelyhistoria</li>').addClass('nav-header'));//Figure out a better way.
    $('#related-events .text-warning').parent().before($('<li>Tulevat käsittelyt</li>').addClass('nav-header'));
    highlightCurrentEvent(window.currentEvent);
    $('#related-events li:not(.nav-header)').click(onRelatedEventSwitch);
    window.relatedEvents = events;
  }

  function onEventFetch(event) {
    formatStrings(event);
    selectCurrentEvent(event);
    $.ajax('/events/' + event['register-number']).done(onRelatedEventsFetch);
  }
  jQuery.fn.render = Transparency.jQueryPlugin;
  $.ajax('/event/' + getParameterByName("id")).done(onEventFetch);

});
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

  function formatStrings(items) {
    items.eventTime = moment(items['date']).format('DD.MM.YYYY');
    items.headingDate = items.category_name + ' ' + items.eventTime;
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

  function selectCurrentItem(acase) {
    return _.find(acase.items, function(element) { return element.id = window.location.hash.replace("#", ""); });
  }

  htmlDirs = {
    content: {
      text: {
        innerHTML: function(params) {
          return this.text;
        }
      }
    }
  }

  function selectCurrentData(acase) {    
    var currentItem = selectCurrentItem(acase);
    var merged = $.extend(acase, currentItem);
    console.log(merged);
    $('#event-main').render(merged, htmlDirs);
    $('#event-detail').render(merged);
    window.currentCase = acase;
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

  function onRelatedEventsFetch(items) {
    _.each(items, formatStrings);
    $('#related-events').render(items, directives);
    $('#related-events').prepend($('<li>Käsittelyhistoria</li>').addClass('nav-header'));//Figure out a better way.
    $('#related-events .text-warning').parent().before($('<li>Tulevat käsittelyt</li>').addClass('nav-header'));
    highlightCurrentEvent(window.currentEvent);
    $('#related-events li:not(.nav-header)').click(onRelatedEventSwitch);
  }

  function onCaseFetch(acase) {
    console.log(acase);
    selectCurrentData(acase);
    //setRelatedEvents(acase.items)
  }

  jQuery.fn.render = Transparency.jQueryPlugin;
  var slug = getParameterByName('id');
  $.ajax('/case/' + slug).done(onCaseFetch);

});
require.config({
    baseUrl: "/js/vendor/",
    paths: {
        "utils": "../utils",
        "moment": "moment.min",
        "underscore": "underscore-min"
    }
});

require(['jquery', 'utils', 'transparency', 'moment', 'underscore'], function($, Utils, Transparency, moment, underscore) {

  relatedDirectives = {
    relatedLink: {
      text: function(params) {
        return this.meeting.committee_name + ' ' + this.meeting.displayDate;
      },
      href: function(params) {
        return '#' + this.id;
      },
      "data-id": function(params) {
        return this.id;
      },
      class: function(params) {
        if (moment(this['event-time']).isAfter(moment())) 
          return 'text-warning';  
      }
    }
  }

  itemDirectives = {
    content: {
      text: {
        innerHTML: function(params) {
          return this.text;
        }
      },
      type: {
        text: function(params) {
          return Utils.Translations[this.type];
        }
      }
    }
  }

  detailDirectives = {
    geo: {
      text: function(params) {
        return this.geometries.length > 0 ? this.geometries[0].name : "Ei tiedossa" ;
      }
    },
    attachments: {
      name: {
        href: function(params) {
          return this.file_uri;
        }
      }
    }
  }

  Utils.ajaxLoader('#loading');

  function selectCurrentItem(acase, itemId) {
    return _.find(acase.items, function(element) { return element.id == itemId });
  }

  function renderMap(data) {
    if (data.geometries.length > 0) {
      var map = L.map('map').setView([60.170833, 24.9375], 13);
      L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{style}/256/{z}/{x}/{y}.png', {
       attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
       maxZoom: 18,
       key: 'BC9A493B41014CAABB98F0471D759707',
       style: 998
       }).addTo(map);

      var marker = L.marker(data.geometries[0].coordinates.reverse()).addTo(map);
      marker.bindPopup(data.geometries[0].name).openPopup();
    } else {
      $('#map').hide();
    }
  }

  function setCurrentData(acase, currentItem) {   
    var merged = $.extend(acase, currentItem);
    $('#event-main').render(merged, itemDirectives);
    $('#event-detail').render(merged, detailDirectives);
    renderMap(merged);
  }

  function highlightCurrentEvent(hashId) {
    window.location.href = hashId;
    $('#related-events li').removeClass('active')
    $('#related-events li [href="' + hashId + '"]').parent().addClass('active');
  } 

  function onRelatedEventSwitch(event) {
    event.preventDefault();
    var itemId = event.currentTarget.childNodes[0].getAttribute('data-id');
    var currentItem = selectCurrentItem(window.currentCase, itemId);
    setCurrentData(window.currentCase, currentItem);
    highlightCurrentEvent('#' + itemId);
  }

  function setRelatedItems(acase) {
    $('#related-events').render(acase.items, relatedDirectives);
    $('#related-events').prepend($('<li>Käsittelyhistoria</li>').addClass('nav-header'));//Figure out a better way.
    $('#related-events .text-warning').parent().before($('<li>Tulevat käsittelyt</li>').addClass('nav-header'));
    highlightCurrentEvent(window.location.hash);
    $('#related-events li:not(.nav-header)').click(onRelatedEventSwitch);
  }

  function formatDates(acase) {
    acase.items = _.map(acase.items, function(item) {
     item.meeting.date = moment(item.meeting.date);
     item.meeting.displayDate = item.meeting.date.format("DD.MM.YYYY");
     return item;
   })
  }

  function onCaseFetch(acase) {    
    window.currentCase = acase; 
    formatDates(acase);
    console.log(acase);
    setRelatedItems(acase);
    var currentIndex = window.location.hash.replace('#', '') != '' ? window.location.hash.replace('#', '') : 0
    var currentItem = selectCurrentItem(acase, currentIndex);
    setCurrentData(acase, currentItem);
  }

  jQuery.fn.render = Transparency.jQueryPlugin;
  var slug = Utils.getParameterByName('id');
  $.ajax('/case/' + slug).done(onCaseFetch);

});
require.config({
    paths: {
        "moment": "moment.min",
    }
});

require(['transparency', 'moment','bootstrap.min','jquery', 'underscore-min'], function(Transparency, moment, bootstrap, $) {

  var Translations = {
    "draft resolution": "Päätösesitys",
    "presenter": "Esittelijä",
    "resolution": "Päätös",
    "summary": "Yhteenveto"
  }

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

  relatedDirectives = {
    relatedLink: {
      text: function(params) {
        return this.meeting.committee_name + ' ' + this.meeting.date;
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
          return Translations[this.type];
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

  function onCaseFetch(acase) {
    console.log(acase);
    window.currentCase = acase; 
    setRelatedItems(acase);
    var currentIndex = window.location.hash.replace('#', '') != '' ? window.location.hash.replace('#', '') : 0
    var currentItem = selectCurrentItem(acase, currentIndex);
    setCurrentData(acase, currentItem);
  }

  jQuery.fn.render = Transparency.jQueryPlugin;
  var slug = getParameterByName('id');
  $.ajax('/case/' + slug).done(onCaseFetch);

});
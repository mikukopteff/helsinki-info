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

  relatedDirectives = {
    relatedLink: {
      text: function(params) {
        return this.committee_name + ' ' + this.date;
      },
      href: function(params) {
        return '#' + this.id;
      },
      id: function(params) {
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
      }
    }
  }

  function selectCurrentItem(acase, itemId) {
    return _.find(acase.items, function(element) { return element.id == itemId });
  }

  function setCurrentData(acase, currentItem) {   
    var merged = $.extend(acase, currentItem);
    $('#event-main').render(merged, itemDirectives);
    $('#event-detail').render(merged);
  }

  function highlightCurrentEvent(currentId) {
    $('#related-events li').removeClass('active')
    $('#related-events li [href="' + currentId + '"]').parent().addClass('active');
  } 

  function onRelatedEventSwitch(event) {
    event.preventDefault();
    var itemId = event.currentTarget.childNodes[0].getAttribute('id');
    var currentItem = selectCurrentItem(window.currentCase, itemId);
    setCurrentData(window.currentCase, currentItem);
    //highlightCurrentEvent(newEvent);
  }

  function setRelatedItems(acase) {
    $('#related-events').render(acase.items, relatedDirectives);
    $('#related-events').prepend($('<li>Käsittelyhistoria</li>').addClass('nav-header'));//Figure out a better way.
    $('#related-events .text-warning').parent().before($('<li>Tulevat käsittelyt</li>').addClass('nav-header'));
    highlightCurrentEvent(window.location.hash);
    $('#related-events li:not(.nav-header)').click(onRelatedEventSwitch);
  }

  function onCaseFetch(acase) {
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
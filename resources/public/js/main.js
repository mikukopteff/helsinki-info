require.config({
    baseUrl: "/js/vendor/",
    paths: {
        "utils": "../utils",
        "moment": "moment.min",
        "bootstrap": "bootstrap.min"
    }
});

require(['jquery', 'moment', 'utils', 'transparency', 'bootstrap'], function($, moment, Utils, Transparency, bootstrap) {
  jQuery.fn.render = Transparency.jQueryPlugin;
  
  directives = {
    oid: {
      oid: function(params) {
        return this._id;
      },
      href: function(params) {
        return 'case.html?id=' + this.slug + '#' + this.items[this.items.length - 1].id;
      }
    },
    committee: {
      text: function(params) {
        return this.items[this.items.length - 1].meeting.committee_name;
      }
    },
    date: {
      text: function(params) {
        return moment(this.items[this.items.length - 1].meeting.date).format("DD.MM.YYYY");
      }
    },
    summary: {
      text: function(params) {
        return  jQuery.trim(this.summary).substring(0, 200).split(" ").slice(0, -1).join(" ") + "...";
      }
    }
  };

  $('#search').click(onSearch);
  $('.row.listing').hide();
  Utils.ajaxLoader('#loading');

  $.ajax('/item/newest').done(
    function(json){
      $('#new-first-row').render(json.splice(0, 2), directives);
      $('#new-second-row').render(json.splice(0, 2), directives);
  });

  function showSearchListing(json) {
    $('.row.listing').fadeIn(500).render(json, directives);
    $('#listing-header').fadeIn(500).text('Haulla \'' + $('#search-input').val() + '\' löytyi ' + json.length + ' tulosta:')

  }

  function onSearch(event){
    event.preventDefault();
    var input = $('#search-input').val();
    if (input != 'undefined' && input != ''){
      $('#listing-loading').show();
      $('#listing').fadeOut(800);
      $.ajax('/search/' + encodeURI($('#search-input').val())).done(showSearchListing);
    }
  }
});
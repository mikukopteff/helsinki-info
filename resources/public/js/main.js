require.config({
    baseUrl: "/js/vendor/",
    paths: {
        "utils": "../utils",
        "moment": "moment.min",
        "bootstrap": "bootstrap.min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"]}
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

  function selectDataToShow(){
    var searchString = window.location.hash.replace('#q=', '');
    if (searchString === '') {
      fetchNewItems();
    } else {
      $('#search-input').val(searchString);
      search(searchString);
    }
  }

  function fetchNewItems() {
    $.ajax('/item/newest').done(
      function(json) {
        $('#listing .row').render(json.splice(0, 2), directives);
        while (json.length > 0) {
          elementRow.clone().appendTo('#listing').render(json.splice(0, 2), directives);
        }

    });
  }

  function showSearchListing(json) {
    var searchResults = elementRow.clone();
    searchResults.children().first().removeClass('span6').addClass('span12');
    searchResults.appendTo('#listing').fadeIn(500).render(json, directives);
    $('#listing-header').fadeIn(500).text('Haulla \'' + $('#search-input').val() + '\' löytyi ' + json.length + ' tulosta:')
  }

  function search(input) {
    if (input != 'undefined' && input != ''){
      $('#listing').children().fadeOut(800, function(){ this.remove() });
      $.ajax('/search/' + encodeURI(input)).done(showSearchListing);
    }
  }

  function onSearchClicked(event) {
    event.preventDefault();
    var input = $('#search-input').val();
    search(input);
  }

  Utils.ajaxLoader('#loading');
  var elementRow = $('#listing .row').clone();
  selectDataToShow()
  $('#search').click(onSearchClicked);
  
});
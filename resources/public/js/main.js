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
    /*
    'committee-link': {
         href: function(params) {
            //fixme: limit and skip
            return "/search/committee/" + this.items[this.items.length - 1].meeting.committee_name + "/limit/100/skip/0";
         }
    },
    */
    date: {
      text: function(params) {
        return moment(this.items[this.items.length - 1].meeting.date).format("DD.MM.YYYY");
      }
    },
    /*
    'date-link': {
        href: function(params) {
            var date = this.items[this.items.length - 1].meeting.date;
            var urlDate = moment(date).format('YYYY-MM-DD');
            return "/cases/date/" + urlDate + "/limit/100/skip/0"; //fixme: limit and skip
        }
    },
    */
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
    $.ajax('/item/newest/1/10').done(
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
    $('#listing-header').fadeIn(500).text('Haulla \'' + window.searchTerm + '\' löytyi ' + json.length + ' tulosta:')
  }

  function doSearchRequest(uri) {
      $('#listing').children().fadeOut(800, function(){ this.remove() });
      $.ajax(uri).done(showSearchListing);
  }

  function search(input) {
    if (input != 'undefined' && input != ''){
      window.searchTerm = $('#search-input').val();
      doSearchRequest('/search/' + encodeURI(input));
    }
  }

  function onSearchClicked(event) {
    event.preventDefault();
    var input = $('#search-input').val();
    search(input);
  }

  function getPage() {
      return 1;
  }

  function getPerPage() {
      return 100;
  }

  Utils.ajaxLoader('#loading');
  var elementRow = $('#listing .row').clone();
  selectDataToShow();
  $('#search').click(onSearchClicked);
  $("#listing").on('click', '.committee-link', function(event) {
      var committeeName = $(event.target).text();
      window.searchTerm = committeeName;
      doSearchRequest('/cases/committee/' + encodeURIComponent(committeeName) + '/' + getPage() + '/' + getPerPage());
  });
  $("#listing").on('click', '.date-link', function(event) {
      var dateStr = $(event.target).text();
      window.searchTerm = dateStr;
      var uriDateStr = encodeURIComponent(moment(dateStr, "DD.MM.YYYY").format("YYYY-MM-DD"));
      doSearchRequest('/cases/date/' + uriDateStr + '/' + getPage() + '/' + getPerPage());
  });
});
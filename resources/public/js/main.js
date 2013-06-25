require.config({
    baseUrl: "/js/vendor/",
    paths: {
        "utils": "../utils",
        "paginator": "../paginator",
        "moment": "moment.min",
        "bootstrap": "bootstrap.min",
        "underscore": "underscore-min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"]}
    }
});

require(['jquery', 'moment', 'utils', 'transparency', 'bootstrap', 'underscore', 'paginator'], function($, moment, Utils, Transparency, bootstrap, _, Paginator) {
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

  var MAX_PAGES_LIMIT = 20;
  var paginator = new Paginator("#pages", MAX_PAGES_LIMIT).setItemFetcher(fetchNewPageOfItems);

  function selectDataToShow(){
    var searchString = window.location.hash.replace('#q=', '');
    if (searchString === '') {
      loadNewItems();
    } else {
      $('#search-input').val(searchString);
      search(searchString);
    }
  }

  function fetchNewPageOfItems(done) {
    $.ajax('/item/newest/' + paginator.getPage() + '/' + paginator.getItemsPerPage()).done(
      function(json) {
        $("#listing .row").remove();
        while (json.length > 0) {
          elementRow.clone().appendTo('#listing').render(json.splice(0, 2), directives);
        }
        if(done) done();
    });
  }

  function loadNewItems() {
    fetchNewPageOfItems(function() {
        paginator.updatePagination(function(done) {
            $.ajax('/item/count').done(function(json) {
                done(json.count);
            });
        });
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

  Utils.ajaxLoader('#loading');
  var elementRow = $('#listing .row').clone();
  selectDataToShow();
  $('#search').click(onSearchClicked);
  $("#listing").on('click', '.committee-link', function(event) {
      var committeeName = $(event.target).text();
      window.searchTerm = committeeName;
      doSearchRequest('/cases/committee/' + encodeURIComponent(committeeName) + '/' + paginator.getPage() + '/' + paginator.getItemsPerPage());
      $('.pagination').hide();
  });
  $("#listing").on('click', '.date-link', function(event) {
      var dateStr = $(event.target).text();
      window.searchTerm = dateStr;
      var uriDateStr = encodeURIComponent(moment(dateStr, "DD.MM.YYYY").format("YYYY-MM-DD"));
      doSearchRequest('/cases/date/' + uriDateStr + '/' + paginator.getPage() + '/' + paginator.getItemsPerPage());
      $('.pagination').hide();
  });

});
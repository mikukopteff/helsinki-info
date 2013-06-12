require.config({
    baseUrl: "/js/vendor/",
    paths: {
        "utils": "../utils",
        "moment": "moment.min",
        "bootstrap": "bootstrap.min",
        "underscore": "underscore-min"
    },
    shim: {
        "bootstrap": { deps: ["jquery"]}
    }
});

require(['jquery', 'moment', 'utils', 'transparency', 'bootstrap', 'underscore'], function($, moment, Utils, Transparency, bootstrap) {
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
      loadNewItems();
    } else {
      $('#search-input').val(searchString);
      search(searchString);
    }
  }

  function numberOfPages(amount) {
    var fullPages = Math.floor(amount / getItemsPerPage());
    console.log("pages: " + fullPages);
    var itemsPerPage = getItemsPerPage();
    return fullPages % itemsPerPage === 0 ? fullPages : fullPages+1;
  }

  function updatePagination(countProvider) {
      countProvider(function(amount) {
          var pages = $("#pages");
          pages.empty();
          pages.append('<li class="disabled"><a href="#">&laquo;</a></li>');
          _(numberOfPages(amount)).times(function(i) {
             var link = $('<a href="#"></a>').attr('class', 'page-link').text(i+1);
             pages.append($('<li></li>').append(link));
          });
          pages.append('<li class="disabled"><a href="#">&raquo;</a></li>');
      });
  }

  function fetchNewItems(done) {
    $.ajax('/item/newest/' + getPage() + '/' + getItemsPerPage()).done(
      function(json) {
        $('#listing .row').render(json.splice(0, 2), directives);
        while (json.length > 0) {
          elementRow.clone().appendTo('#listing').render(json.splice(0, 2), directives);
        }
        if(done) done();
    });
  }

  function loadNewItems() {
    fetchNewItems(function() {
        updatePagination(function(done) {
            $.ajax('/item/count').done(function(json) {
                done(json.count);
            });
        });
    });
  }

  //fixme: generalize page switch data fetching
  function switchPage(page) {
      window.currentPage = page;
      fetchNewItems();
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
      if(!window.currentPage) window.currentPage = 1;
      return window.currentPage;
  }

  function getItemsPerPage() {
      return 2;
  }

  Utils.ajaxLoader('#loading');
  var elementRow = $('#listing .row').clone();
  selectDataToShow();
  $('#search').click(onSearchClicked);
  $("#listing").on('click', '.committee-link', function(event) {
      var committeeName = $(event.target).text();
      window.searchTerm = committeeName;
      doSearchRequest('/cases/committee/' + encodeURIComponent(committeeName) + '/' + getPage() + '/' + getItemsPerPage());
  });
  $("#listing").on('click', '.date-link', function(event) {
      var dateStr = $(event.target).text();
      window.searchTerm = dateStr;
      var uriDateStr = encodeURIComponent(moment(dateStr, "DD.MM.YYYY").format("YYYY-MM-DD"));
      doSearchRequest('/cases/date/' + uriDateStr + '/' + getPage() + '/' + getItemsPerPage());
  });

  $("#pages").on('click', '.page-link', function(event) {
     switchPage($(event.target).text());
  });
});
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

  function SearchStateBase(colCount) {
    this.colCount = colCount;
  }

  SearchStateBase.prototype = {
    generateSearchResultHeader: function (count) {
      var resultString = 'Haulla \'' + window.searchTerm + '\' ';
      if (count == 0) {
        resultString = resultString + 'ei löytynyt tuloksia.';
      }
      else {
        resultString = resultString + 'löytyi ' + count + ' tulos';
        if (count == 1) {
          resultString = resultString + ':'; // "1 tulos:"
        }
        else {
          resultString = resultString + 'ta:'; // e.g. "2 tulosta:"
        }
      }
      return resultString;  
    }
  }

  function SearchStateNonCached(colCount, searchUriBase) {
    var newState = new SearchStateBase(colCount);
    newState.searchUriBase = searchUriBase;

    newState.fetchNewPageOfItems = function (done) {
      var searchUri = this.searchUriBase + paginator.getPage() + '/' + paginator.getItemsPerPage();
      $.ajax(searchUri).done(
        function(json) {
          readItems(json);
          if (done) done();
        }
      );
    }

    return newState;
  }

  function SearchStateNewest() {
    var searchUriBase = '/item/newest/';
    var newState = new SearchStateNonCached(2, searchUriBase);

    newState.generateSearchResultHeader = function(count) {
      return 'Uusimmat';
    }

    return newState;
  }

  function SearchStateByTag(searchUriBase) {
    var newState = SearchStateNonCached(1, searchUriBase);
    return newState;
  }

  function SearchStateCached(colCount, json) {
    var newState = new SearchStateBase(colCount);
    newState.fullTextSearchResultJson = $.extend(true, [], json); // deep copy

    newState.fetchNewPageOfItems = function (done) {
      var temp = $.extend(true, [], this.fullTextSearchResultJson); // deep copy
      skipItemsOnPreviousPages(temp);
      readItems(temp);
      if (done) done();
    };

    return newState;
  }
    
  function SearchStateByKeyword(json) {
    var newState = new SearchStateCached(1, json);
    return newState;
  }

  var searchState = new SearchStateNewest();

  var MAX_PAGES_LIMIT = 20;
  var paginator = new Paginator("#pages", MAX_PAGES_LIMIT).setItemFetcher(fetchNewPageOfItems);

  function selectDataToShow(){
    var searchString = window.location.hash.replace('#q=', '');
    if (searchString === '') {
      doSearchRequestNewest();
    } else {
      $('#search-input').val(searchString);
      search(searchString);
    }
  }

  function loadNewItems() {
    fetchNewPageOfItems(function() {
        paginator.updatePagination(function(done) {
            $.ajax(countUri).done(function(json) {
                done(json.count);
                updatePaginatorVisibility(json.count);
            });
        });
    });
  }

  function skipItemsOnPreviousPages(json) {
    var numberToSkip = (paginator.getPage() - 1) * paginator.getItemsPerPage();
    json.splice(0, numberToSkip);
  }

  function fetchNewPageOfItems(done) {
    searchState.fetchNewPageOfItems(done);
  }

  function loadNewItemsWithKnownCount(count) {
    fetchNewPageOfItems(function() {
        paginator.updatePagination(function(done) {
            done(count);
        });
    });
    updatePaginatorVisibility(count);
  }
  
  function readItems(json) {
    removeRows();
    var colCount = searchState.colCount;
    if (colCount == 1) {
      elementRow.children().first().removeClass('span6').addClass('span12');
    }
    else {
      elementRow.children().first().removeClass('span12').addClass('span6');
    }
    
    while (json.length > 0 && $("#listing .row").length * colCount < paginator.getItemsPerPage()) {
      elementRow.clone().appendTo('#listing').render(json.splice(0, colCount), directives);
    }
  }

  function updatePaginatorVisibility(count) {
    if (count <= paginator.getItemsPerPage()) {
      $('.pagination').hide();
    }
    else {
      $('.pagination').show();
    }
  }

  function searchCountFirst(json) {
    $('#listing-header').text(searchState.generateSearchResultHeader(json.count));
    loadNewItemsWithKnownCount(json.count);
  }

  function searchWithoutCountingFirst(json) {
    searchState = new SearchStateByKeyword(json);
    count = json.length;
    $('#listing-header').text(searchState.generateSearchResultHeader(count));
    paginator.updatePagination(function(done) {
      done(count);
    });
    updatePaginatorVisibility(count);
    paginator.switchPage(1);
  }    

  function removeRows() {
    $("#listing .row").remove();
  }

  function removeHeader() {
    $('#listing-header').text('');
  }

  function clearPreviousResults() {
    removeHeader();
    removeRows();
  }

  function doSearchRequestNewest() {
    clearPreviousResults();
    searchState = new SearchStateNewest();
    countUri = '/item/count';
    $.ajax(countUri).done(searchCountFirst);
  }

  function doSearchRequestByTag(searchUriBase, countUri) {
    clearPreviousResults();
    searchState = new SearchStateByTag(searchUriBase);
    $.ajax(countUri).done(searchCountFirst);
  }

  function doSearchRequestByKeyword(fullTextSearchUri) {
    clearPreviousResults();
    $.ajax(fullTextSearchUri).done(searchWithoutCountingFirst);
  }

  function search(input) {
    if (input != 'undefined' && input != ''){
      window.searchTerm = $('#search-input').val();
      var fullTextSearchUri = '/search/' + encodeURI(input);
      doSearchRequestByKeyword(fullTextSearchUri);
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
      var searchUriBase = '/cases/committee/' + encodeURIComponent(committeeName) + '/';
      var countUri = '/item/count/committee/' + encodeURIComponent(committeeName);
      doSearchRequestByTag(searchUriBase, countUri);
  });
  $("#listing").on('click', '.date-link', function(event) {
      var dateStr = $(event.target).text();
      window.searchTerm = dateStr;
      var uriDateStr = encodeURIComponent(moment(dateStr, "DD.MM.YYYY").format("YYYY-MM-DD"));
      var searchUriBase = '/cases/date/' + uriDateStr + '/';
      var countUri = '/item/count/date/' + uriDateStr;
      doSearchRequestByTag(searchUriBase, countUri);
  });
});
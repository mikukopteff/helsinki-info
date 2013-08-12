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

  var searchUriBase = '/item/newest/';
  var countUri = '/item/count';
  var fullTextSearchUri = null;
  var fullTextSearchResultJson = null;
  var colCount = 2;

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
    if (fullTextSearchResultJson != null) {
      var temp = $.extend(true, [], fullTextSearchResultJson); // deep copy
      readItems(temp)
    }
    else {
      var searchUri = searchUriBase + paginator.getPage() + '/' + paginator.getItemsPerPage();
      $.ajax(searchUri).done(
        function(json) {
          readItems(json);
          if(done) done();
      });
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

  function loadNewItemsWithKnownCount(count) {
    fetchNewPageOfItems(function() {
        paginator.updatePagination(function(done) {
            done(count);
        });
    });
    updatePaginatorVisibility(count);
  }
  
  function readItems(json) {
    $("#listing .row").remove();
    if (colCount == 1) {
      elementRow.children().first().removeClass('span6').addClass('span12');
    }
    else {
      elementRow.children().first().removeClass('span12').addClass('span6');
    }      
    if (countUri == null) {
      // skip the items that belong to the earlier pages
      var counter = 0;
      while (counter < (paginator.getPage() - 1) * paginator.getItemsPerPage()) {
        json.splice(0, colCount);
        counter = counter + 1;
      }
    }
    while (json.length > 0 && $("#listing .row").length < paginator.getItemsPerPage()) {
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

  function generateSearchResultHeader(count) {
    var resultString = 'Haulla \'' + window.searchTerm + '\' ';
    if (count == 0) {
      resultString = resultString + 'ei löytynyt tuloksia.';
    }
    else {
	  resultString = resultString + 'löytyi ' + count + ' tulos';
      if (count == 1)
        resultString = resultString + ':'; // "1 tulos:"
      else
        resultString = resultString + 'ta:'; // e.g. "2 tulosta:"
    }
    return resultString;  
  }

  function searchCountFirst(json) {
    $('#listing-header').fadeIn(500).text(generateSearchResultHeader(json.count))
    loadNewItemsWithKnownCount(json.count)
  }

  function searchWithoutCountingFirst(json) {
    fullTextSearchResultJson = $.extend(true, [], json); // deep copy;
    count = json.length;
    $('#listing-header').fadeIn(500).text(generateSearchResultHeader(count))
    paginator.updatePagination(function(done) {
      done(count);
    });
    updatePaginatorVisibility(count);
    //$('.pagination').hide(); // no paginator is needed
    readItems(json);
  }    

  function doSearchRequest() {
    $('#listing').children().fadeOut(800, function(){ this.remove() });
    paginator.switchPage(1);
    if (countUri != null) {
      console.assert(searchUriBase != null, 'searchUriBase == null when countUri != null')
      $.ajax(countUri).done(searchCountFirst);
    }
    else {
      $.ajax(fullTextSearchUri).done(searchWithoutCountingFirst);
    }
  }

  function search(input) {
    if (input != 'undefined' && input != ''){
      window.searchTerm = $('#search-input').val();
      fullTextSearchUri = '/search/' + encodeURI(input);
      searchUriBase = null
      countUri = null
      colCount = 1;
      fullTextSearchResultJson = null;
      doSearchRequest();
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
      searchUriBase = '/cases/committee/' + encodeURIComponent(committeeName) + '/';
      countUri = '/item/count/committee/' + encodeURIComponent(committeeName);
      fullTextSearchUri = null;
      fullTextSearchResultJson = null;
      colCount = 1;
      doSearchRequest();
  });
  $("#listing").on('click', '.date-link', function(event) {
      var dateStr = $(event.target).text();
      window.searchTerm = dateStr;
      var uriDateStr = encodeURIComponent(moment(dateStr, "DD.MM.YYYY").format("YYYY-MM-DD"));
      searchUriBase = '/cases/date/' + uriDateStr + '/';
      countUri = '/item/count/date/' + uriDateStr;
      fullTextSearchUri = null;
      fullTextSearchResultJson = null;
      colCount = 1;
      doSearchRequest();
  });

});
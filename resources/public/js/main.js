require(['jquery', 'transparency', 'bootstrap.min'], function($, Transparency) {
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
        console.log(this.items[this.items.length - 1].meeting.date);
      }
    }
  };

  $('#search').click(onSearch);

  $.ajax('/item/newest').done(
    function(json){
      $('#new-first-row').render(json.splice(0, 2), directives);
      $('#new-second-row').render(json.splice(0, 2), directives);
  });

  function showSearchListing(json) {
    $('#listing-loading').fadeOut();
    console.log(json);
    $('.row.listing').fadeIn(500).render(json, directives);
    $('#listing-header').fadeIn(500).text('Haulla \'' + $('#search-input').val() + '\' löytyi ' + json.length + ' tulosta:')

  }

  function onSearch(event){
    event.preventDefault();
    var input = $('#search-input').val();
    if (input != 'undefined' && input != ''){
      console.log(input);
      $('#listing-loading').show();
      $('#listing').fadeOut(800);
      $.ajax('/search/' + encodeURI($('#search-input').val())).done(showSearchListing);
    }
  }

  $('.row.listing').hide();

  $('#listing-loading')
    .hide()
    .ajaxStart(function() {
      $(this).show();
    })
    .ajaxStop(function() {
      $(this).hide();
    });
});
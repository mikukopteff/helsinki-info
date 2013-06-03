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
    }
  };

  $('#search').click(onSearch);

  $.ajax('/item/newest').done(
    function(json){
      $('#new-first-row').render(json.splice(0, 2), directives);
      $('#new-second-row').render(json.splice(0, 2), directives);
  });

  function clearListingArea(){
    $('#listing').hide(800);
  }

  function showSearchListing(json) {
    console.log(json);
    //$('#listing').
  }

  function onSearch(event){
    event.preventDefault();
    var input = $('#search-input').val();
    if (input != 'undefined' && input != ''){
      console.log(input);
      clearListingArea();
      $.ajax('/search/' + $('#search-input').val()).done(showSearchListing);
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
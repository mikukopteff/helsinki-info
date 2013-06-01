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

$.ajax('/item/newest').done(
  function(json){
    //console.log(json);
    $('#new-first-row').render(json.splice(0, 2), directives);
    $('#new-second-row').render(json.splice(0, 2), directives);
  });
});
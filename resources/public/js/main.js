require(['jquery', 'transparency', 'bootstrap.min'], function($, Transparency) {
  jQuery.fn.render = Transparency.jQueryPlugin;
  
directives = {
  oid: {
    oid: function(params) {
      return this._id;
    },
    href: function(params) {
      var itemIndex = (this.items.length > 1) ? this.items.length - 1 : 0; //This is just for now. When first page listing is done, will pick the newest
      return 'case.html?id=' + this.slug + '#' + this.items[itemIndex].id;
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
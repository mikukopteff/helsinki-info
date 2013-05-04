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

$.ajax('/cases').done(
  function(json){
    console.log(json);
    $('#cases').render(json, directives);
  });
});
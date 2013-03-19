require(['jquery', 'transparency', 'bootstrap.min'], function($, Transparency) {
  jQuery.fn.render = Transparency.jQueryPlugin;
  
directives = {
  oid: {
    oid: function(params) {
      return this._id;
    },
    href: function(params) {
      return 'decision.html?id=' + this._id;
    }
  }
};

$.ajax('http://localhost:3000/events').done(
  function(json){
    $('#events').render(json, directives);
  });
});
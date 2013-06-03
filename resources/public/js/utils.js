define([], function() {

  return {
    Translations: {
      "draft resolution": "Päätösesitys",
      "presenter": "Esittelijä",
      "resolution": "Päätös",
      "summary": "Yhteenveto"
    },
    getParameterByName: function(name) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }
});

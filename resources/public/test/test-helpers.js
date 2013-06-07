define(function() {
  var that = {}

  that.showResults = function() {
    $('#sut').hide()
    $('#mocha').show()
  }

  that.showSut = function() {
    $('#mocha').hide()
    $('#sut').show()
  }

  that.waitForAjax = function(done) {
    var childWindow = $('#sut')[0].contentWindow
    if (childWindow.$.active === 0) return done()
    childWindow.$(childWindow.document).one('ajaxStop', function() { done(); })
  }

  that.setHtml = function(pageAddress) {
  	$('#sut').prop('src', pageAddress);
  }

  that.findFromSUT = function(selector) {
      return $('#sut').contents().find(selector)
  }

  return that;
})